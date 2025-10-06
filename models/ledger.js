import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    group: { type: String, trim: true },   // e.g., ASSET, LIABILITY, INCOME, EXPENSE
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },

    propertyCode: { type: String, trim: true, uppercase: true }, // optional scope by property
  },
  { timestamps: true }
);

export default mongoose.models.Ledger || mongoose.model("Ledger", ledgerSchema);
