import mongoose from "mongoose";
import { type } from "os";

const accessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  reference: { type: String, required: true },
  purchasedAt: { type: Date, default: Date.now },
});

accessSchema.index({ user: 1, book: 1 }, { unique: true });

const Access = mongoose.model("access", accessSchema);

export default Access;
