import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["reader", "admin"],
      default: "reader",
    },
    phoneNumber: {
      type: String,
    },
    address: {
      type: {
        street: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        zip: {
          type: String,
        },
        country: {
          type: String,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
