import mongoose from "mongoose";
import Order from "../models/Order.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Joi from "joi";

export const createOrder = asyncHandler(async (req, res, next) => {
  const { name, email, address, phone, productId, totalPrice } = req.body;

  if (!name || !email || !address || !phone || !productId || !totalPrice) {
    return next(new apiError(400, "All fields are required"));
  }

  const validProductIds = productId.map((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new apiError(400, `Invalid productId: ${id}`));
    }
    return new mongoose.Types.ObjectId(id);
  });

  const order = await Order.create({
    name,
    email,
    address,
    phone,
    productId: validProductIds,
    totalPrice,
  });

  if (!order) {
    return next(new apiError(500, "Failed to create order"));
  }

  return res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: order,
  });
});

export const getOrdersByUserEmail = asyncHandler(async (req, res, next) => {
  const email = req.query.email;

  if (!email) {
    return next(new apiError(400, "Email is required"));
  }

  const formattedEmail = email.trim().replace(/\s+/g, "").toLowerCase();

  const orders = await Order.find({
    email: formattedEmail,
  }).populate("productId", "title category");

  const orderCount = orders.length;

  if (!orders) {
    return next(new apiError(404, "No orders found for this user"));
  }

  if (orders.length === 0) {
    return next(new apiError(404, "User has not placed any orders"));
  }

  return res.status(200).json({
    success: true,
    message: `Found ${orderCount} orders placed by ${orders[0].name}`,
    count: orderCount,
    data: orders,
  });
});

const validateOrder = (order) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required().label("Name"),
    email: Joi.string().email().required().label("Email"),
    phone: Joi.number().required().label("Phone"),
    address: Joi.object({
      city: Joi.string().required().label("City"),
      country: Joi.string().required().label("Country"),
      state: Joi.string().required().label("State"),
      zipcode: Joi.string().required().label("Zipcode"),
    })
      .required()
      .label("Address"),
    productId: Joi.array().min(1).required().label("Product IDs"),
    totalPrice: Joi.number().required().label("Total Price"),
  });

  return schema.validate(order);
};
