import express from "express";
import {
  getAllBooksPurchasedByUser,
  getAllUsersWhoPurchasedSpecificBook,
  getTotalRevenue,
  getMostPurchasedBooks,
  getTotalUsers,
  getTotalBooks,
  getMonthlySales,
  getAverageOrderValue,
  getTopGenresBySales,
  getTotalActiveUsers,
  getTotalBooksByCategory,
} from "../controllers/Access.js";
import { isAuthenticated, isAuthorized } from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/total-revenue", getTotalRevenue);
router.get("/stats/most-purchased-books", getMostPurchasedBooks);
router.get("/stats/total-users", getTotalUsers);
router.get("/stats/total-books", getTotalBooks);
router.get("/stats/monthly-sales", getMonthlySales);
router.get("/stats/average-order-value", getAverageOrderValue);
router.get("/stats/top-genres-by-sales", getTopGenresBySales);
router.get("/stats/total-active-users", getTotalActiveUsers);
router.get("/stats/total-books-by-category", getTotalBooksByCategory);
router.get("/my-books", isAuthenticated, getAllBooksPurchasedByUser);

router.get(
  "/users/:bookId",
  isAuthenticated,
  isAuthorized("admin"),
  getAllUsersWhoPurchasedSpecificBook
);

export default router;
