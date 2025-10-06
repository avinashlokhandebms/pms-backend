import mongoose from "mongoose";

const TAX_TYPES = ["exclusive", "inclusive", "none"];
const TYPES = ["EP","CP","MAP","AP","BB","HB","FB","CUSTOM"];

const mealPlanSchema = new mongoose.Schema(
  {
    propertyCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    code:         { type: String, required: true, uppercase: true, trim: true },
    name:         { type: String, required: true, trim: true },

    // your requested fields
    details:      { type: String, default: "" },               // free text
    taxType:      { type: String, enum: TAX_TYPES, default: "none" },
    isActive:     { type: Boolean, default: true },

    // keep type for plan category (EP/CP/MAP/…)
    type:         { type: String, enum: TYPES, default: "EP" },

    // legacy/optional description if you still use it in UI
    description:  { type: String, default: "" },
  },
  { timestamps: true }
);

// unique per property
mealPlanSchema.index({ propertyCode: 1, code: 1 }, { unique: true });

export default mongoose.model("MealPlan", mealPlanSchema);
export { TAX_TYPES, TYPES };
