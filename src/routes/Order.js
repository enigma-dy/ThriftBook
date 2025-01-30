import express from "express";
const router = express.Router();

import { createOrder, getOrdersByUserEmail } from "../controllers/Order.js";

router.post("/create", createOrder);
router.get("/user", getOrdersByUserEmail);

export default router;
