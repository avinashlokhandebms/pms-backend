// backend/models/salesperson.js
import mongoose from "mongoose";

const SalesPersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      validate: {
        validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email",
      },
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 32,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Optional: you can add unique index on email if you want uniqueness
// SalesPersonSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: "string", $ne: "" } } });

export default mongoose.model("SalesPerson", SalesPersonSchema);
