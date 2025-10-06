// backend/models/room.js
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    propertyCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    roomNo:       { type: String, required: true, trim: true },
    roomTypeCode: { type: String, required: true, uppercase: true, trim: true, index: true },

    floor:        { type: String, trim: true, default: "" },
    status:       { type: String, enum: ["vacant", "occupied", "ooo", "oos", "reserved"], default: "vacant", index: true },
    houseStatus:  { type: String, enum: ["clean", "dirty", "inspect"], default: "clean" },

    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One property cannot have duplicate room numbers
schema.index({ propertyCode: 1, roomNo: 1 }, { unique: true });

export default mongoose.model("Room", schema);
