import axios from "axios";
import { apiError } from "../utils/apiError.js";
import Access from "../models/Access.js";
import Book from "../models/Book.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = "https://api.paystack.co";

export const initiatePayment = asyncHandler(async (req, res, next) => {
  const { amount, bookId } = req.body;
  const userId = req.user._id;
  const email = req.user.email;

  if (!email || !amount || !bookId || !userId) {
    return next(
      new apiError(400, "Email, amount, bookId, and userId are required")
    );
  }

  const existingAccess = await Access.findOne({ user: userId, book: bookId });
  if (existingAccess) {
    return res.status(200).json({
      success: true,
      message: "User already owns this book",
    });
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100,
        metadata: { bookId, userId },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Paystack Error:", error.response?.data || error.message);
    return next(
      new apiError(
        500,
        error.response?.data?.message || "Payment initialization failed"
      )
    );
  }
});

export const verifyPayment = async (reference) => {
  try {
    const response = await fetch(
      `${BASE_URL}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return await response.json();
  } catch (error) {
    throw new Error(`Paystack Error: ${error.message}`);
  }
};

export const handlePaymentWebhook = asyncHandler(async (req, res, next) => {
  const paystackSignature = req.headers["x-paystack-signature"];

  if (process.env.NODE_ENV !== "production" && !paystackSignature) {
    console.log("Skipping signature verification for local testing...");
  } else {
    if (!paystackSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing webhook signature",
      });
    }

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== paystackSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }
  }

  const { event, data } = req.body;

  if (event === "charge.success") {
    const { reference, amount, customer, metadata } = data;
    const { bookId, userId } = metadata;
    const email = customer.email;

    const purchaseBook = await Access.create({
      user: userId,
      book: bookId,
      reference,
    });
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  }

  return res.status(400).json({
    success: false,
    message: "Unhandled event type",
  });
});
