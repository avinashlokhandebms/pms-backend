// models/Zone.js
import mongoose from "mongoose";

const ZoneSchema = new mongoose.Schema(
  {
    propertyCode: { type: String, trim: true, uppercase: true, default: "", index: true },

    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },

    // Hierarchy (Zone → Area → City → State)
    areaCode:  { type: String, required: true, trim: true, uppercase: true },
    cityCode:  { type: String, trim: true, uppercase: true, default: "" },
    stateCode: { type: String, trim: true, uppercase: true, default: "" },

    description: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique per property
ZoneSchema.index({ propertyCode: 1, code: 1 }, { unique: true });
// Quick text search
ZoneSchema.index({ code: "text", name: "text", areaCode: "text", cityCode: "text", stateCode: "text", description: "text" });

ZoneSchema.pre("save", function (next) {
  ["propertyCode", "code", "areaCode", "cityCode", "stateCode"].forEach(k => {
    if (typeof this[k] === "string") this[k] = this[k].trim().toUpperCase();
  });
  ["name", "description"].forEach(k => {
    if (typeof this[k] === "string") this[k] = this[k].trim();
  });
  next();
});

export default mongoose.models.Zone || mongoose.model("Zone", ZoneSchema);
