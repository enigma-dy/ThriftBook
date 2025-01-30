import express from "express";
import {
  initiatePayment,
  handlePaymentWebhook,
  verifyPayment,
} from "../controllers/Payment.js";

const router = express.Router();

router.post("/initiate", initiatePayment);

router.post("/webhook", handlePaymentWebhook);

router.post("/verify", verifyPayment);

export default router;
