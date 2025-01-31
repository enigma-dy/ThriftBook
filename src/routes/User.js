import express from "express";
const router = express.Router();
import { isAuthenticated } from "../middlewares/isAuth.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getUserBooks,
  getUserPurchaseHistory,
} from "../controllers/User.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/current-user", isAuthenticated, getCurrentUser);
router.get("/mybooks", isAuthenticated, getUserBooks);
router.get(
  "/stats/user-purchase-history",
  isAuthenticated,
  getUserPurchaseHistory
);

export default router;
