import axios from "axios";
import { apiError } from "../utils/apiError.js";
import Access from "../models/Access.js";
import Book from "../models/Book.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import sha512 from "js-sha512";

const OPayBaseURL =
  "https://testapi.opaycheckout.com/api/v1/international/payment/create";

export const initiatePayment = async (req, res, next) => {
  // Hard-coded form data for testing purposes
  const formData = {
    amount: {
      currency: "NGN",
      total: 400, // Hard-coded amount for testing
    },
    bankcard: {
      cardHolderName: "DAVID",
      cardNumber: "4508712345678901", // Test card number
      cvv: "100",
      enable3DS: true,
      expiryMonth: "02", // Test expiry month
      expiryYear: "26", // Test expiry year
    },
    callbackUrl: "https://your-callback-url.com", // Replace with a test callback URL
    country: "NG",
    payMethod: "QRCode",
    product: {
      description: "Testing product description",
      name: "Testing Product",
    },
    reference: "041233989101", // Test reference
    returnUrl: "https://your-return-url.com", // Replace with a test return URL
  };

  const privateKey = "OPAYPRV17376310405350.11965821573715696"; // Replace with your OPay private key
  const merchantId = "281825012382362"; // Replace with your OPay merchant ID

  // Generate HMAC signature
  const hash = sha512.hmac.create(privateKey);
  hash.update(JSON.stringify(formData));
  const hmacSignature = hash.hex();

  try {
    const response = await axios.post(
      "https://testapi.opaycheckout.com/api/v1/international/payment/create",
      formData,
      {
        headers: {
          MerchantId: merchantId,
          Authorization: `Bearer ${hmacSignature}`,
        },
      }
    );

    if (response.data && response.data.code === "00000") {
      return res.status(200).json({
        success: true,
        message: "Payment initialized successfully",
        data: response.data,
      });
    } else {
      console.error("OPay API Error:", response.data);
      return res.status(400).json({
        success: false,
        message: response.data.message || "Failed to initialize payment",
      });
    }
  } catch (error) {
    console.error(
      "Payment Initialization Error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "OPay Payment Initialization Error",
    });
  }
};

export const handlePaymentWebhook = asyncHandler(async (req, res, next) => {
  const { eventType, data } = req.body;

  if (eventType === "TRANSACTION_SUCCESS") {
    const { userId, bookId, reference } = data;

    // Check if the book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return next(new apiError(404, "Book not found"));
    }

    // Check if the user already has access
    const existingAccess = await Access.findOne({ user: userId, book: bookId });
    if (existingAccess) {
      return res.status(200).json({
        success: true,
        message: "User already owns this book",
      });
    }

    // Grant access to the book
    const newAccess = await Access.create({
      user: userId,
      book: bookId,
    });

    if (!newAccess) {
      return next(new apiError(500, "Failed to create access record"));
    }

    book.totalReaders += 1;
    await book.save();

    return res.status(200).json({
      success: true,
      message: "Access granted for the purchased book!",
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Unhandled payment event type",
    });
  }
});

export const verifyPayment = async (req, res, next) => {
  const { reference } = req.body;

  try {
    const response = await axios.get(`${OPayBaseURL}/transaction/status`, {
      params: { reference },
      headers: {
        Authorization: `Bearer ${process.env.OPAY_SECRET_KEY}`,
      },
    });

    if (response.data && response.data.code === "00000") {
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: response.data.data,
      });
    } else {
      return next(new apiError(400, "Failed to verify payment"));
    }
  } catch (error) {
    console.error("Payment Verification Error:", error.message);
    return next(new apiError(500, "OPay Payment Verification Error"));
  }
};
