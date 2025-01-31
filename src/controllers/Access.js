import Access from "../models/Access.js";
import Book from "../models/Book.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

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

export const getTotalRevenue = asyncHandler(async (req, res, next) => {
  const totalRevenue = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);
  res.status(200).json({
    success: true,
    message: "Total revenue retrieved successfully",
    data: totalRevenue[0]?.totalRevenue || 0,
  });
});

export const getMostPurchasedBooks = asyncHandler(async (req, res, next) => {
  const mostPurchasedBooks = await Access.aggregate([
    {
      $group: {
        _id: "$book",
        purchaseCount: { $sum: 1 },
      },
    },
    { $sort: { purchaseCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "_id",
        as: "bookDetails",
      },
    },
    { $unwind: "$bookDetails" },
    {
      $project: {
        _id: 0,
        bookTitle: "$bookDetails.title",
        purchaseCount: 1,
      },
    },
  ]);
  res.status(200).json({
    success: true,
    message: "Most purchased books retrieved successfully",
    data: mostPurchasedBooks,
  });
});

export const getTotalUsers = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  res.status(200).json({
    success: true,
    message: "Total users retrieved successfully",
    data: totalUsers,
  });
});

export const getTotalBooks = asyncHandler(async (req, res, next) => {
  const totalBooks = await Book.countDocuments();
  res.status(200).json({
    success: true,
    message: "Total books retrieved successfully",
    data: totalBooks,
  });
});

export const getMonthlySales = asyncHandler(async (req, res, next) => {
  const monthlySales = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.status(200).json({
    success: true,
    message: "Monthly sales retrieved successfully",
    data: monthlySales,
  });
});

export const getAverageOrderValue = asyncHandler(async (req, res, next) => {
  const averageOrderValue = await Order.aggregate([
    {
      $group: {
        _id: null,
        averageValue: { $avg: "$totalPrice" },
      },
    },
  ]);
  res.status(200).json({
    success: true,
    message: "Average order value retrieved successfully",
    data: averageOrderValue[0]?.averageValue || 0,
  });
});

export const getTopGenresBySales = asyncHandler(async (req, res, next) => {
  const topGenres = await Access.aggregate([
    {
      $lookup: {
        from: "books",
        localField: "book",
        foreignField: "_id",
        as: "bookDetails",
      },
    },
    { $unwind: "$bookDetails" },
    {
      $group: {
        _id: "$bookDetails.genre",
        totalSales: { $sum: 1 },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 5 },
  ]);
  res.status(200).json({
    success: true,
    message: "Top genres by sales retrieved successfully",
    data: topGenres,
  });
});

export const getTotalActiveUsers = asyncHandler(async (req, res, next) => {
  const totalActiveUsers = await Access.distinct("user");
  res.status(200).json({
    success: true,
    message: "Total active users retrieved successfully",
    data: totalActiveUsers.length,
  });
});

export const getTotalBooksByCategory = asyncHandler(async (req, res, next) => {
  const booksByCategory = await Book.aggregate([
    {
      $group: {
        _id: "$category",
        totalBooks: { $sum: 1 },
      },
    },
  ]);
  res.status(200).json({
    success: true,
    message: "Total books by category retrieved successfully",
    data: booksByCategory,
  });
});
