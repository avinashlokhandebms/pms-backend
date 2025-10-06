// models/state.js
import mongoose from "mongoose";

const StateSchema = new mongoose.Schema(
  {
    // Optional scope: blank string means global
    propertyCode: { type: String, trim: true, uppercase: true, default: "", index: true },

    // Business identifier (unique within a property)
    code: { type: String, required: true, trim: true, uppercase: true },

    name: { type: String, required: true, trim: true },

    description: { type: String, trim: true, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// uniqueness within (propertyCode, code)
StateSchema.index({ propertyCode: 1, code: 1 }, { unique: true });

// quick search
StateSchema.index({ code: "text", name: "text", description: "text" });

// normalize before save
StateSchema.pre("save", function (next) {
  if (typeof this.propertyCode === "string") this.propertyCode = this.propertyCode.trim().toUpperCase();
  if (typeof this.code === "string") this.code = this.code.trim().toUpperCase();
  if (typeof this.name === "string") this.name = this.name.trim();
  if (typeof this.description === "string") this.description = this.description.trim();
  next();
});

// normalize on findOneAndUpdate (PATCH)
StateSchema.pre("findOneAndUpdate", function (next) {
  const u = this.getUpdate() || {};
  const set = u.$set || u;

  if (set.propertyCode !== undefined) set.propertyCode = String(set.propertyCode || "").trim().toUpperCase();
  if (set.code !== undefined) set.code = String(set.code || "").trim().toUpperCase();
  if (set.name !== undefined) set.name = String(set.name || "").trim();
  if (set.description !== undefined) set.description = String(set.description || "").trim();

  if (u.$set) u.$set = set; else this.setUpdate(set);
  next();
});

export default mongoose.models.State || mongoose.model("State", StateSchema);
    