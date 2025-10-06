// models/City.js
import mongoose from "mongoose";

const CitySchema = new mongoose.Schema(
  {
    // Optional property scope (empty string = global)
    propertyCode: { type: String, trim: true, uppercase: true, default: "", index: true },

    // Business identifier (unique within a property)
    code: { type: String, required: true, trim: true, uppercase: true },

    name: { type: String, required: true, trim: true },

    // Link to state by code (kept denormalized for speed)
    stateCode: { type: String, required: true, trim: true, uppercase: true },

    description: { type: String, trim: true, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique per (propertyCode, code)
CitySchema.index({ propertyCode: 1, code: 1 }, { unique: true });
// Quick text search
CitySchema.index({ code: "text", name: "text", stateCode: "text", description: "text" });

// Normalize before save
CitySchema.pre("save", function (next) {
  if (typeof this.propertyCode === "string") this.propertyCode = this.propertyCode.trim().toUpperCase();
  if (typeof this.code === "string") this.code = this.code.trim().toUpperCase();
  if (typeof this.name === "string") this.name = this.name.trim();
  if (typeof this.stateCode === "string") this.stateCode = this.stateCode.trim().toUpperCase();
  if (typeof this.description === "string") this.description = this.description.trim();
  next();
});

export default mongoose.models.City || mongoose.model("City", CitySchema);
