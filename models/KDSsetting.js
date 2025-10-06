// Mongoose model for Kitchen Display System (KDS) settings
import mongoose from "mongoose";

const KDSSettingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    displayLocation: { type: String, trim: true, default: "" }, // e.g., Kitchen-1, Bar, Pastry
    printer: { type: String, trim: true, default: "" },         // optional: the mapped printer name/id
    isActive: { type: Boolean, default: true },

    // optional multi-property support (if you scope settings by property)
    propertyCode: { type: String, trim: true, uppercase: true },
  },
  { timestamps: true }
);

// Avoid model overwrite on dev hot-reload
export default mongoose.models.KDSSetting || mongoose.model("KDSSetting", KDSSettingSchema);
