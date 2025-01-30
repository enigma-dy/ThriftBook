import express from "express";
import {
  getAllBooksPurchasedByUser,
  getAllUsersWhoPurchasedSpecificBook,
} from "../controllers/Access.js";
import { isAuthenticated, isAuthorized } from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/my-books", isAuthenticated, getAllBooksPurchasedByUser);

router.get(
  "/users/:bookId",
  isAuthenticated,
  isAuthorized("admin"),
  getAllUsersWhoPurchasedSpecificBook
);

export default router;
