// models/version.js
import mongoose from "mongoose";

const VersionSchema = new mongoose.Schema(
  {
    // Optional scope; empty string means global
    propertyCode: { type: String, trim: true, uppercase: true, default: "", index: true },

    // Business identifier (unique within a property)
    code: { type: String, required: true, trim: true, uppercase: true },

    name: { type: String, required: true, trim: true },

    description: { type: String, trim: true, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique per (propertyCode, code)
VersionSchema.index({ propertyCode: 1, code: 1 }, { unique: true });
// Quick text search
VersionSchema.index({ code: "text", name: "text", description: "text" });

// Normalize before save
VersionSchema.pre("save", function (next) {
  if (typeof this.propertyCode === "string") this.propertyCode = this.propertyCode.trim().toUpperCase();
  if (typeof this.code === "string") this.code = this.code.trim().toUpperCase();
  if (typeof this.name === "string") this.name = this.name.trim();
  if (typeof this.description === "string") this.description = this.description.trim();
  next();
});

export default mongoose.models.Version || mongoose.model("Version", VersionSchema);
