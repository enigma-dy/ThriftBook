import mongoose, { Schema } from "mongoose";
import subjectGenreMap from "./data/modelData.js";
import User from "./User.js";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      index: true,
      required: [true, "Title is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      validate: {
        validator: function (value) {
          return subjectGenreMap.some((entry) => entry.subject === value);
        },
        message: "Invalid category. Please select a valid subject.",
      },
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      validate: {
        validator: function (value) {
          const subjectEntry = subjectGenreMap.find(
            (entry) => entry.subject === this.category
          );
          return subjectEntry?.genres.includes(value);
        },
        message: "Invalid genre. Please select a valid genre for the category.",
      },
    },
    trending: {
      type: Boolean,
      default: false,
    },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    file: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: Number,
      required: [true, "Old Price is required"],
    },
    newPrice: {
      type: Number,
      required: [true, "New Price is required"],
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      default: null,
    },
    totalReaders: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.pre("save", async function (next) {
  if (this.threadId) {
    const parentBook = await this.constructor.findById(this.threadId);
    if (!parentBook) {
      return next(new Error("Invalid threadId: Parent book not found."));
    }
  }
  next();
});

bookSchema.statics.fetchThread = async function (threadId) {
  return this.find({
    $or: [{ _id: threadId }, { threadId }],
  }).sort({ createdAt: 1 });
};

const Book = mongoose.model("Book", bookSchema);

export default Book;
