import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Designation", schema);
