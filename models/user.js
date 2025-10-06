// import mongoose from "mongoose";

// const membershipSchema = new mongoose.Schema({
//   propertyCode: { type: String, required: true },
//   role: { type: String, enum: ["superadmin","admin","user"], required: true },
//   modules: [{ type: String, required: true }],
// });

// const userSchema = new mongoose.Schema(
//   {
//     customerId: { type: String, required: true, unique: true },
//     name:       { type: String, required: true },
//     passwordHash: { type: String, required: true },   // ✅ REQUIRED
//     memberships: [membershipSchema],
//   },
//   { timestamps: true }
// );


// const userSchema = new mongoose.Schema({
//   customerId: String,
//   name: String,
//   email: { type: String, unique: true },
//   password: String,   // store hashed password here
//   memberships: [
//     {
//       propertyCode: String,
//       role: String,
//       modules: [String],
//     },
//   ],
// });
// export default mongoose.model("User", userSchema);



// backend/models/user.js
// import mongoose from "mongoose";

// const MembershipSchema = new mongoose.Schema(
//   {
//     propertyCode: { type: String, required: true, uppercase: true, trim: true },
//     role: { type: String, enum: ["superadmin", "admin", "employee"], default: "employee" },
//     modules: { type: [String], default: [] },
//   },
//   { _id: false }
// );

// const UserSchema = new mongoose.Schema(
//   {
//     customerId: { type: String, required: true, unique: true, trim: true },
//     name: { type: String, required: true, trim: true },
//     email: { type: String, trim: true },
//     mobileNo: { type: String, trim: true },
//     passwordHash: { type: String, required: true }, // store hash only
//     isActive: { type: Boolean, default: true },
//     memberships: { type: [MembershipSchema], default: [] },
//   },
//   { timestamps: true }
// );

// UserSchema.index({ customerId: 1 }, { unique: true });

// export default mongoose.model("User", UserSchema);



import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    propertyCode: { type: String, required: true, uppercase: true, trim: true },
    role: { type: String, required: true, enum: ["superadmin", "admin", "employee"] },
    modules: [{ type: String, trim: true }],
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, unique: true, sparse: true }, // sparse avoids duplicate-null error
    mobileNo: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },

    // Optional “global” role or summary
    role: { type: String, enum: ["superadmin", "admin", "employee"], default: "employee" },
    // Optional global module list (handy for dashboard)
    modules: [{ type: String, trim: true }],

    memberships: { type: [membershipSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.index({ customerId: 1 }, { unique: true });
// keep email sparse unique to allow multiple nulls
userSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.model("User", userSchema);
  