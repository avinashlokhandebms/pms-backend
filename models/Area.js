// models/Area.js
import mongoose from "mongoose";

const AreaSchema = new mongoose.Schema(
  {
    // Optional scope ("" means global)
    propertyCode: { type: String, trim: true, uppercase: true, default: "", index: true },

    // Business identifier (unique within property)
    code: { type: String, required: true, trim: true, uppercase: true },

    name: { type: String, required: true, trim: true },

    // Link to City by its code (denormalized string)
    cityCode: { type: String, required: true, trim: true, uppercase: true },

    // (Optional) keep stateCode too if you want faster filtering
    stateCode: { type: String, trim: true, uppercase: true, default: "" },

    pincode: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique per property
AreaSchema.index({ propertyCode: 1, code: 1 }, { unique: true });
// Quick search
AreaSchema.index({ code: "text", name: "text", cityCode: "text", stateCode: "text", description: "text" });

AreaSchema.pre("save", function (next) {
  ["propertyCode", "code", "cityCode", "stateCode"].forEach((k) => {
    if (typeof this[k] === "string") this[k] = this[k].trim().toUpperCase();
  });
  ["name", "description", "pincode"].forEach((k) => {
    if (typeof this[k] === "string") this[k] = this[k].trim();
  });
  next();
});

export default mongoose.models.Area || mongoose.model("Area", AreaSchema);


