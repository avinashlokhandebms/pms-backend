// backend/models/roomtype.js
import mongoose from "mongoose";

const RoomTypeSchema = new mongoose.Schema(
  {
    // Which property this room type belongs to
    propertyCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    // Short code for the room type (unique within a property)
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    // Display name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional description
    description: { type: String, trim: true, default: "" },

    // Max occupancy
    capacity: { type: Number, min: 1, default: 1 },
  },
  { timestamps: true }
);

// Unique per property
RoomTypeSchema.index({ propertyCode: 1, code: 1 }, { unique: true });

// Optional: clean JSON/output (remove __v)
RoomTypeSchema.set("toJSON", {
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model("RoomType", RoomTypeSchema);
