import express from "express";
const router = express.Router();
import {
  createBook,
  getAllBooks,
  getSingleBook,
  updateBook,
  getPaidBooks,
  readBook,
  getTotalPurchasedBooks,
  deleteBook,
  getTrendingBooks,
} from "../controllers/Book.js";
import { isAuthenticated } from "../middlewares/isAuth.js";

router.post("/create", isAuthenticated, createBook);
router.get("/stats/total-purchased-books", getTotalPurchasedBooks);
router.get("/stats/trending-books", getTrendingBooks);
router.get("/all", getAllBooks);
router.get("/single/:id", getSingleBook);
router.get("mybooks", getSingleBook);
router.get("/read/:id", getSingleBook);
router.put("/update/:id", isAuthenticated, updateBook);
router.delete("/delete/:id", isAuthenticated, deleteBook);

export default router;
