import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    address: {
      city: { type: String, required: true },
      country: { type: String, required: true },
      state: { type: String, required: true },
      zipcode: { type: String, required: true },
    },
    phone: {
      type: Number,
      required: [true, "Phone is required"],
    },
    productId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: [true, "Product ID is required"],
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, "Total Price is required"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
