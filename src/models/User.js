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

    paymentMethod: {
      type: String,
      enum: ["Card", "paypal", "bankTransfer"],
    },
    paymentToken: {
      type: String,
    },
    paymentCard: {
      type: {
        cardNumber: {
          type: String,
        },
        expirationMonth: {
          type: Number,
        },
        expirationYear: {
          type: Number,
        },
        cvv: {
          type: String,
        },
      },
    },
    billingAddress: {
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
