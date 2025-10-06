// models/TaxRateName.js
import mongoose from "mongoose";

const TaxRateNameSchema = new mongoose.Schema(
  {
    propertyCode: { type: String, trim: true, uppercase: true, default: "", index: true },

    code: { type: String, required: true, trim: true, uppercase: true }, // e.g. CGST, SGST
    name: { type: String, required: true, trim: true },                  // e.g. Central GST
    description: { type: String, trim: true, default: "" },

    isInclusive: { type: Boolean, default: false }, // whether tax name is treated as inclusive (optional)
    displayOrder: { type: Number, default: 0 },     // for sorting (optional)

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique per property
TaxRateNameSchema.index({ propertyCode: 1, code: 1 }, { unique: true });

// Quick text search
TaxRateNameSchema.index({
  code: "text",
  name: "text",
  description: "text",
});

TaxRateNameSchema.pre("save", function (next) {
  ["propertyCode", "code"].forEach(k => {
    if (typeof this[k] === "string") this[k] = this[k].trim().toUpperCase();
  });
  ["name", "description"].forEach(k => {
    if (typeof this[k] === "string") this[k] = this[k].trim();
  });
  next();
});

export default mongoose.models.TaxRateName || mongoose.model("TaxRateName", TaxRateNameSchema);
