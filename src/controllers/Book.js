import Book from "../models/Book.js";
import Access from "../models/Access.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadImageOnCloudinary,
  deleteImageFromCloudinary,
  uploadFileToCloudinary,
} from "../utils/cloudinary.js";

import Joi from "joi";
import { buildBookQuery } from "../utils/buildQuery.js";

export const createBook = asyncHandler(async (req, res, next) => {
  const userData = req.user;
  const author = req.user._id;

  if (userData.role !== "admin") {
    return next(new apiError(403, "Unauthorized request"));
  }

  const { error } = validateBook(req.body);

  if (error) {
    return next(new apiError(400, error.details[0].message));
  }

  const {
    title,
    description,
    category,
    genre,
    trending,
    oldPrice,
    newPrice,
    threadId,
  } = req.body;

  const existingBook = await Book.findOne({ title });
  if (existingBook) {
    return next(new apiError(409, "A book with this title already exists"));
  }

  if (!req.files || !req.files.image) {
    return next(new apiError(400, "Image is required"));
  }

  const image = req.files.image;
  const cloudinaryUploadResult = await uploadImageOnCloudinary(image.data);
  if (!cloudinaryUploadResult) {
    return next(new apiError(500, "Failed to upload image to Cloudinary"));
  }

  const file = req.files.file;
  const fileExtension = file.name.split(".").pop();
  const fileName = `${new Date().getTime()}.${fileExtension}`;
  if (!req.files || !req.files.file) {
    return next(new apiError(400, "Document  is required"));
  }

  const cloudinaryFileResult = await uploadFileToCloudinary(
    file.data,
    fileName
  );

  if (!cloudinaryFileResult) {
    return next(new apiError(500, "Failed to upload file to Cloudinary"));
  }

  const cloudinaryImage = {
    url: cloudinaryUploadResult.secure_url,
    publicId: cloudinaryUploadResult.public_id,
  };

  const fileUrl = cloudinaryFileResult.secure_url;

  const formattedBook = {
    title: title.trim().replace(/\s+/g, " "),
    description: description.trim().replace(/\s+/g, " "),
    category: category.trim().replace(/\s+/g, " "),
    author,
    genre: genre.trim().replace(/\s+/g, " "),
    trending,
    image: cloudinaryImage,
    file: fileUrl,
    oldPrice,
    newPrice,
    threadId: threadId || null,
  };

  if (threadId) {
    const parentBook = await Book.findById(threadId);
    if (!parentBook) {
      return next(new apiError(400, "Invalid threadId: Parent book not found"));
    }

    if (parentBook.owner.toString() !== userData._id.toString()) {
      return next(
        new apiError(403, "You are not authorized to add books to this thread")
      );
    }

    formattedBook.collectibleBook = true;
  } else {
    formattedBook.collectibleBook = false;
  }

  const book = await Book.create(formattedBook);
  if (!book) {
    return next(
      new apiError(500, "Something went wrong while creating the book")
    );
  }

  return res.status(201).json({
    success: true,
    message: "Book created successfully!",
    data: book,
  });
});

export const getAllBooks = asyncHandler(async (req, res, next) => {
  const { query, options } = buildBookQuery(req.query);

  const books = await Book.find(query)
    .select("-file")
    .skip(options.skip)
    .limit(options.limit)
    .sort(options.sort)
    .populate({
      path: "author",
      select: "name email",
    });

  if (books.length === 0) {
    return next(new apiError(404, "No books found matching the criteria"));
  }

  res.status(200).json({
    success: true,
    message: "Books fetched successfully",
    count: books.length,
    currentPage: options.skip / options.limit + 1,
    totalPages: Math.ceil(books.length / options.limit),
    data: books,
  });
});

export const getSingleBook = asyncHandler(async (req, res, next) => {
  const bookId = req.params.id;

  if (!bookId) {
    return next(new apiError(400, "Book id is required"));
  }

  const book = await Book.findById(bookId).select("-file");

  if (!book) {
    return next(new apiError(404, "Book not found"));
  }

  return res.status(200).json({
    success: true,
    message: "Book fetched successfully",
    data: book,
  });
});

export const updateBook = asyncHandler(async (req, res, next) => {
  const userData = req.user;

  if (userData.role !== "admin") {
    return next(new apiError(403, "Unauthorized request"));
  }

  const bookId = req.params.id;

  if (!bookId) {
    return next(new apiError(400, "Book id is required"));
  }

  const { error } = validateBook(req.body);
  if (error) {
    return next(new apiError(400, error.details[0].message));
  }

  const { title, description, category, trending, oldPrice, newPrice } =
    req.body;

  const findedBook = await Book.findById(bookId).select("-file");
  if (!findedBook) {
    return next(new apiError(404, "Book not found"));
  }

  let cloudinaryImage = findedBook.image;
  let fileUrl = findedBook.file;

  if (req.files?.image) {
    const image = req.files.image;

    const cloudinaryUploadResult = await uploadImageOnCloudinary(image.data);
    if (!cloudinaryUploadResult) {
      return next(new apiError(500, "Failed to upload image to Cloudinary"));
    }

    if (findedBook?.image?.publicId) {
      const cloudinaryDeleteResult = await deleteImageFromCloudinary(
        findedBook.image.publicId
      );
      if (!cloudinaryDeleteResult) {
        return next(
          new apiError(
            500,
            `Failed to delete image with ID: ${findedBook.image.publicId} from Cloudinary`
          )
        );
      }
    }

    cloudinaryImage = {
      url: cloudinaryUploadResult.secure_url,
      publicId: cloudinaryUploadResult.public_id,
    };
  }

  if (req.files?.file) {
    const file = req.files.file;
    const fileExtension = file.name.split(".").pop();
    const fileName = `${new Date().getTime()}.${fileExtension}`;

    const cloudinaryFileResult = await uploadFileToCloudinary(
      file.data,
      fileName
    );
    if (!cloudinaryFileResult) {
      return next(new apiError(500, "Failed to upload file to Cloudinary"));
    }

    fileUrl = cloudinaryFileResult.secure_url;
  }

  const formattedBook = {
    title: title.trim().replace(/\s+/g, " "),
    description: description.trim().replace(/\s+/g, " "),
    category: category,
    trending,
    image: cloudinaryImage,
    file: fileUrl,
    oldPrice,
    newPrice,
  };

  const book = await Book.findByIdAndUpdate(bookId, formattedBook, {
    new: true,
  });

  if (!book) {
    return next(new apiError(500, "Something went wrong while updating book"));
  }

  return res.status(200).json({
    success: true,
    message: "Book updated successfully",
    data: book,
  });
});

export const deleteBook = asyncHandler(async (req, res, next) => {
  const userData = req.user;

  if (userData.role !== "admin") {
    return next(new apiError(403, "unauthorized Request"));
  }

  const { title } = req.body;
  const bookId = req.params.id;

  if (!bookId) {
    return next(new apiError(400, "Book id is required"));
  }

  const book = await Book.findById(bookId);

  if (!book) {
    return next(new apiError(404, "Book not found"));
  }

  // remove image from cloudinary
  if (book?.image?.publicId) {
    const cloudinaryDeleteResult = await deleteImageFromCloudinary(
      book?.image?.publicId
    );
    if (!cloudinaryDeleteResult) {
      return next(
        new apiError(
          500,
          `Failed to delete image with ID: ${image.publicId} from Cloudinary`
        )
      );
    }
  }

  const deletedBook = await Book.findByIdAndDelete(bookId);

  if (!deletedBook) {
    return next(new apiError(500, "Something went wrong while deleting book"));
  }

  return res.status(200).json({
    success: true,
    message: "Book deleted successfully",
  });
});

export const getPaidBooks = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Find all books the user has access to
  const userBooks = await Access.find({ user: userId }).populate(
    "book",
    "title description image"
  );

  if (!userBooks || userBooks.length === 0) {
    return next(new apiError(404, "No books found for this user"));
  }

  return res.status(200).json({
    success: true,
    message: "Books retrieved successfully",
    data: userBooks,
  });
});

export const readBook = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const bookId = req.params.bookId;

  // Check if the user has access to the book
  const access = await Access.findOne({ user: userId, book: bookId });
  if (!access) {
    return next(new apiError(403, "You do not have access to this book"));
  }

  // Fetch the book content
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new apiError(404, "Book not found"));
  }

  return res.status(200).json({
    success: true,
    message: "Book retrieved successfully",
    data: book,
  });
});

export const getTotalPurchasedBooks = asyncHandler(async (req, res, next) => {
  const totalPurchasedBooks = await Access.countDocuments();
  res.status(200).json({
    success: true,
    message: "Total purchased books retrieved successfully",
    data: totalPurchasedBooks,
  });
});

export const getTrendingBooks = asyncHandler(async (req, res, next) => {
  const trendingBooks = await Book.find({ trending: true });
  res.status(200).json({
    success: true,
    message: "Trending books retrieved successfully",
    data: trendingBooks,
  });
});
const validateBook = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(80).required(),
    description: Joi.string().min(10).required(),
    author: Joi.string(),
    category: Joi.string().required(),
    genre: Joi.string().required(),
    trending: Joi.boolean(),
    oldPrice: Joi.number().required(),
    newPrice: Joi.number().required(),
    threadId: Joi.string(),
  });

  return schema.validate(data);
};
