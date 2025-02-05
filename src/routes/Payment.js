import express from "express";
import {
  initiatePayment,
  handlePaymentWebhook,
  verifyPayment,
} from "../controllers/Payment.js";
import { isAuthenticated } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/initiate", isAuthenticated, initiatePayment);

router.post("/webhook", handlePaymentWebhook);

router.post("/verify", verifyPayment);

export default router;
