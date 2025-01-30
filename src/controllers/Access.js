import Access from "../models/Access.js";
import Book from "../models/Book.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";

export const getAllBooksPurchasedByUser = asyncHandler(
  async (req, res, next) => {
    const userId = req.user._id;

    const userBooks = await Access.find({ user: userId }).populate("book");
    if (!userBooks || userBooks.length === 0) {
      return next(new apiError(404, "No books found for this user"));
    }

    return res.status(200).json({
      success: true,
      message: "Books retrieved successfully!",
      data: userBooks,
    });
  }
);

export const getAllUsersWhoPurchasedSpecificBook = asyncHandler(
  async (req, res, next) => {
    const { bookId } = req.params;

    const users = await Access.find({ book: bookId }).populate("user");
    if (!users || users.length === 0) {
      return next(new apiError(404, "No users found for this book"));
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully!",
      data: users,
    });
  }
);
