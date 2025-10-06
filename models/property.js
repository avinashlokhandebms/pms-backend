// // backend/models/property.js
// import mongoose from "mongoose";

// const propertySchema = new mongoose.Schema(
//   {
//     code: { type: String, required: true, unique: true },
//     name: { type: String, required: true },
//     ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Property", propertySchema);


// backend/models/property.js
// import mongoose from "mongoose";

// const { Schema } = mongoose;

// /* ---------- Payment sub-schemas ---------- */
// const paymentModeSchema = new Schema(
//   {
//     mode: { type: String, required: true, enum: ["CASH", "CARD", "UPI", "BANK", "WALLET"] },
//     enabled: { type: Boolean, default: true },
//     surchargePct: { type: Number, default: 0 }, // e.g., 2 -> 2%
//   },
//   { _id: false }
// );

// const bankAccountSchema = new Schema(
//   {
//     label: { type: String, trim: true },
//     accountName: { type: String, trim: true },
//     accountNumber: { type: String, trim: true },
//     ifsc: { type: String, trim: true },
//     bankName: { type: String, trim: true },
//     branch: { type: String, trim: true },
//     swift: { type: String, trim: true },
//     isDefault: { type: Boolean, default: false },
//   },
//   { _id: false }
// );

// const upiHandleSchema = new Schema(
//   {
//     vpa: { type: String, trim: true },           // hotel@icici
//     displayName: { type: String, trim: true },   // Front Desk UPI
//     isDefault: { type: Boolean, default: false },
//   },
//   { _id: false }
// );

// const paymentGatewaySchema = new Schema(
//   {
//     type: {
//       type: String,
//       required: true,
//       enum: ["RAZORPAY", "STRIPE", "CASHFREE", "PAYU", "PAYPAL", "CUSTOM"],
//     },
//     name: { type: String, trim: true },
//     enabled: { type: Boolean, default: false },

//     // What tender types this gateway handles
//     supports: { type: [String], default: [], enum: ["CARD", "UPI", "WALLET", "NETBANKING"] },

//     // Common credential fields (keep generic)
//     merchantId: { type: String, trim: true },
//     keyId: { type: String, trim: true },
//     keySecret: { type: String, trim: true },
//     clientId: { type: String, trim: true },
//     clientSecret: { type: String, trim: true },

//     webhookUrl: { type: String, trim: true },
//     webhookSecret: { type: String, trim: true },

//     extra: { type: Schema.Types.Mixed },
//   },
//   { _id: false }
// );

// /* ---------- Property schema ---------- */
// const propertySchema = new Schema(
//   {
//     code: { type: String, required: true, unique: true, trim: true, uppercase: true },
//     name: { type: String, required: true, trim: true },

//     // Optional commercial info
//     keyPersonName: { type: String, trim: true },
//     email: { type: String, trim: true },
//     mobileNo: { type: String, trim: true },

//     currency: { type: String, default: "INR" },
//     timezone: { type: String, default: "Asia/Kolkata" },

//     ownerUserId: { type: Schema.Types.ObjectId, ref: "User" },

//     // Payments
//     payment: {
//       modes: {
//         type: [paymentModeSchema],
//         default: [
//           { mode: "CASH", enabled: true, surchargePct: 0 },
//           { mode: "CARD", enabled: true, surchargePct: 0 },
//           { mode: "UPI", enabled: true, surchargePct: 0 },
//           { mode: "BANK", enabled: true, surchargePct: 0 },
//         ],
//       },
//       gateways: { type: [paymentGatewaySchema], default: [] },
//       bankAccounts: { type: [bankAccountSchema], default: [] },
//       upi: { type: [upiHandleSchema], default: [] },
//       allowPartial: { type: Boolean, default: true },
//       minAdvancePct: { type: Number, default: 0 }, // 0–100
//     },
//   },
//   { timestamps: true }
// );

// propertySchema.index({ code: 1 }, { unique: true });

// const Property = mongoose.models.Property || mongoose.model("Property", propertySchema);
// export default Property;
  
import mongoose from "mongoose";
const { Schema } = mongoose;

const paymentModeSchema = new Schema(
  {
    mode: { type: String, required: true, enum: ["CASH", "CARD", "UPI", "BANK", "WALLET"] },
    enabled: { type: Boolean, default: true },
    surchargePct: { type: Number, default: 0 },
  },
  { _id: false }
);

const bankAccountSchema = new Schema(
  {
    label: { type: String, trim: true },
    accountName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifsc: { type: String, trim: true },
    bankName: { type: String, trim: true },
    branch: { type: String, trim: true },
    swift: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const upiHandleSchema = new Schema(
  {
    vpa: { type: String, trim: true },
    displayName: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const paymentGatewaySchema = new Schema(
  {
    type: { type: String, required: true, enum: ["RAZORPAY", "STRIPE", "CASHFREE", "PAYU", "PAYPAL", "CUSTOM"] },
    name: { type: String, trim: true },
    enabled: { type: Boolean, default: false },
    supports: { type: [String], default: [], enum: ["CARD", "UPI", "WALLET", "NETBANKING"] },
    merchantId: { type: String, trim: true },
    keyId: { type: String, trim: true },
    keySecret: { type: String, trim: true },
    clientId: { type: String, trim: true },
    clientSecret: { type: String, trim: true },
    webhookUrl: { type: String, trim: true },
    webhookSecret: { type: String, trim: true },
    extra: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const propertySchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User" },

    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },

    payment: {
      modes: {
        type: [paymentModeSchema],
        default: [
          { mode: "CASH", enabled: true },
          { mode: "CARD", enabled: true },
          { mode: "UPI", enabled: true },
          { mode: "BANK", enabled: true },
        ],
      },
      gateways: { type: [paymentGatewaySchema], default: [] },
      bankAccounts: { type: [bankAccountSchema], default: [] },
      upi: { type: [upiHandleSchema], default: [] },
      allowPartial: { type: Boolean, default: true },
      minAdvancePct: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

propertySchema.index({ code: 1 }, { unique: true });

export default mongoose.model("Property", propertySchema);
