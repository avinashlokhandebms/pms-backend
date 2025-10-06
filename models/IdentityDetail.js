import mongoose from "mongoose";

const IdentityDetailSchema = new mongoose.Schema(
  {
    propertyCode: { type: String, trim: true, uppercase: true, default: "", index: true }, // "" = global
    code:         { type: String, required: true, trim: true, uppercase: true },
    name:         { type: String, required: true, trim: true },
    description:  { type: String, trim: true, default: "" },
    isNumberRequired: { type: Boolean, default: true },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique within a property
IdentityDetailSchema.index({ propertyCode: 1, code: 1 }, { unique: true });
// Text search
IdentityDetailSchema.index({ code: "text", name: "text", description: "text" });

IdentityDetailSchema.pre("save", function (next) {
  if (typeof this.propertyCode === "string") this.propertyCode = this.propertyCode.trim().toUpperCase();
  if (typeof this.code === "string") this.code = this.code.trim().toUpperCase();
  if (typeof this.name === "string") this.name = this.name.trim();
  if (typeof this.description === "string") this.description = this.description.trim();
  next();
});

export default mongoose.models.IdentityDetail || mongoose.model("IdentityDetail", IdentityDetailSchema);
