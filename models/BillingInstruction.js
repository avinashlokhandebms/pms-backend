// models/BillingInstruction.js
import mongoose from "mongoose";

const BillingInstructionSchema = new mongoose.Schema(
  {
    // Optional property context; "" means global
    propertyCode: { type: String, trim: true, uppercase: true, default: "", index: true },

    // Business identifier (unique within a property)
    code: { type: String, required: true, trim: true, uppercase: true },

    // Display title
    title: { type: String, required: true, trim: true },

    // Rich/long text allowed
    description: { type: String, trim: true, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique per (propertyCode, code)
BillingInstructionSchema.index({ propertyCode: 1, code: 1 }, { unique: true });

// Quick text search
BillingInstructionSchema.index({ code: "text", title: "text", description: "text" });

// Normalize before save
BillingInstructionSchema.pre("save", function (next) {
  if (typeof this.propertyCode === "string") this.propertyCode = this.propertyCode.trim().toUpperCase();
  if (typeof this.code === "string") this.code = this.code.trim().toUpperCase();
  if (typeof this.title === "string") this.title = this.title.trim();
  if (typeof this.description === "string") this.description = this.description.trim();
  next();
});

// Normalize on findOneAndUpdate too
BillingInstructionSchema.pre("findOneAndUpdate", function (next) {
  const upd = this.getUpdate() || {};
  const $set = upd.$set || upd;

  if ($set.propertyCode != null) $set.propertyCode = String($set.propertyCode).trim().toUpperCase();
  if ($set.code != null) $set.code = String($set.code).trim().toUpperCase();
  if ($set.title != null) $set.title = String($set.title).trim();
  if ($set.description != null) $set.description = String($set.description).trim();

  next();
});

export default mongoose.models.BillingInstruction ||
  mongoose.model("BillingInstruction", BillingInstructionSchema);
