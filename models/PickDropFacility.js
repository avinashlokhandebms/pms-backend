// models/PickDropFacility.js
import mongoose from "mongoose";

const PickDropFacilitySchema = new mongoose.Schema(
  {
    // Optional property context; empty string means global/none
    propertyCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
      index: true,
    },

    // Business identifier (unique within a property)
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    // Display name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // PICKUP / DROP / BOTH
    type: {
      type: String,
      enum: ["PICKUP", "DROP", "BOTH"],
      default: "BOTH",
      uppercase: true,
      trim: true,
    },

    description: { type: String, trim: true, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique per (propertyCode, code)
PickDropFacilitySchema.index({ propertyCode: 1, code: 1 }, { unique: true });
// Quick text search
PickDropFacilitySchema.index({
  code: "text",
  name: "text",
  type: "text",
  description: "text",
});

// Normalize before save
PickDropFacilitySchema.pre("save", function (next) {
  if (typeof this.propertyCode === "string") {
    this.propertyCode = this.propertyCode.trim().toUpperCase();
  }
  if (typeof this.code === "string") {
    this.code = this.code.trim().toUpperCase();
  }
  if (typeof this.name === "string") {
    this.name = this.name.trim();
  }
  if (typeof this.type === "string") {
    this.type = this.type.trim().toUpperCase();
  }
  if (typeof this.description === "string") {
    this.description = this.description.trim();
  }
  next();
});

export default mongoose.models.PickDropFacility ||
  mongoose.model("PickDropFacility", PickDropFacilitySchema);
