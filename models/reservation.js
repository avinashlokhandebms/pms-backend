// backend/models/reservation.js
import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
  {
    // SCOPE
    propertyCode: { type: String, required: true, index: true },

    // Business fields (align with your UI)
    reservationNo: { type: String, index: true },
    guestName: { type: String },
    phone: { type: String },
    email: { type: String },

    roomType: { type: String },
    checkIn: { type: Date },
    checkOut: { type: Date },
    nights: { type: Number, default: 1 },
    rooms: { type: Number, default: 1 },
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    infant: { type: Number, default: 0 },

    mealPlan: { type: String },     // EP/CP/MAP/AP
    rateCode: { type: String },     // BAR/...
    ratePlan: { type: String },
    rate: { type: Number, default: 0 }, // tariff per night
    amount: { type: Number, default: 0 },

    reservationMode: { type: String }, // OTA/FIT/Corporate/Travel Agent
    companyName: { type: String },     // optional
    salesPerson: { type: String },

    notes: { type: String },
    specialRequest: { type: String },
    billingInstruction: { type: String },

    status: {
      type: String,
      enum: ["Booked", "Confirmed", "Cancelled", "NoShow", "CheckedIn", "CheckedOut"],
      default: "Booked",
      index: true,
    },

    // AUDIT
    createdById: { type: String },
    createdByName: { type: String },
    createdIp: { type: String },
    updatedById: { type: String },
    updatedByName: { type: String },
    updatedIp: { type: String },
  },
  { timestamps: true }
);

ReservationSchema.index({ propertyCode: 1, reservationNo: 1 }, { unique: false });

export default mongoose.model("Reservation", ReservationSchema);
