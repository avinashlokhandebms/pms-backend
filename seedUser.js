// // backend/seedUser.js
// import "dotenv/config.js";
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// import User from "./models/user.js";
// import Property from "./models/property.js";

// async function run() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log("✅ Connected to MongoDB");

//     // Clear old data (optional, only in dev)
//     await User.deleteMany({});
//     await Property.deleteMany({});

//     // Create sample properties
//     const properties = await Property.create([
//       {
//         code: "HSE001",
//         name: "Hotel Sunrise",
//         keyPersonName: "Mr. A",
//         contactNo: "0141-123456",
//         mobileNo: "9876543210",
//         email: "sunrise@example.com",
//         location: "Jaipur",
//         country: "India",
//         state: "Rajasthan",
//         city: "Jaipur",
//         address: "MI Road, Jaipur",
//         salesPerson: "Sales A",
//       },
//       {
//         code: "HSE002",
//         name: "Hotel Sunset",
//         keyPersonName: "Mr. B",
//         contactNo: "0141-987654",
//         mobileNo: "9876501234",
//         email: "sunset@example.com",
//         location: "Udaipur",
//         country: "India",
//         state: "Rajasthan",
//         city: "Udaipur",
//         address: "Lake Pichola, Udaipur",
//         salesPerson: "Sales B",
//       },

//       {
//         code: "53124",
//         name: "Hotel Sunrise",
//         keyPersonName: "Mr. Avinash",
//         contactNo: "0141-123456",
//         mobileNo: "9876543210",
//         email: "sunrise@example.com",
//         location: "Jaipur",
//         country: "India",
//         state: "Rajasthan",
//         city: "Jaipur",
//         address: "MI Road, Jaipur",
//         salesPerson: "Sales A",
//       },
//     ]);

//     // Create superadmin with hashed password
//     const passwordHash = await bcrypt.hash("Pass@1234", 10);

//     const superadmin = await User.create({
//       customerId: "super",
//       name: "Ava Super",
//       passwordHash,
//       memberships: properties.map((p) => ({
//         propertyCode: p.code,
//         role: "superadmin",
//         modules: [
//           "bookingEngine",
//           "reservation",
//           "backoffice",
//           "frontdesk",
//           "pos",
//           "housekeeping",
//           "kds",
//           "report",
//           "inventory",
//         ],
//       })),
//     });

//     console.log("✅ Superadmin created:");
//     console.log("   customerId:", superadmin.customerId);
//     console.log("   password:   Pass@1234");

//     await mongoose.disconnect();
//     console.log("🔌 Disconnected");
//   } catch (err) {
//     console.error("❌ Error seeding user:", err);
//     process.exit(1);
//   }
// }

// run();


// backend/seedUsers.js
// import "dotenv/config.js";
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import User from "./models/user.js";

// async function run() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, { autoIndex: true });
//     console.log("✅ Mongo connected");

//     await User.deleteMany({});

//     const hash1 = await bcrypt.hash("Pass@1234", 10);
//     const hash2 = await bcrypt.hash("Admin@123", 10);
//     const hash3 = await bcrypt.hash("Emp@123", 10);

//     await User.create([
//       {
//         customerId: "super",
//         name: "Ava Super",
//         email: "super@example.com",
//         mobileNo: "9999990000",
//         passwordHash: hash1,
//         isActive: true,
//         memberships: [
//           { propertyCode: "HSE001", role: "superadmin", modules: ["reservation", "frontdesk", "backoffice"] },
//           { propertyCode: "HSE002", role: "superadmin", modules: ["reservation", "frontdesk"] },
//         ],
//       },
//       {
//         customerId: "admin1",
//         name: "Ravi Admin",
//         email: "ravi@example.com",
//         mobileNo: "9999990001",
//         passwordHash: hash2,
//         isActive: true,
//         memberships: [
//           { propertyCode: "HSE001", role: "admin", modules: ["reservation", "frontdesk"] },
//         ],
//       },
//       {
//         customerId: "emp1",
//         name: "Neha Employee",
//         email: "neha@example.com",
//         mobileNo: "9999990002",
//         passwordHash: hash3,
//         isActive: true,
//         memberships: [
//           { propertyCode: "HSE001", role: "employee", modules: ["reservation"] },
//         ],
//       },
//     ]);

//     console.log("✅ Seeded users:");
//     console.log("  super / Pass@1234");
//     console.log("  admin1 / Admin@123");
//     console.log("  emp1 / Emp@123");

//     await mongoose.disconnect();
//     console.log("🔌 Disconnected");
//   } catch (err) {
//     console.error("❌ Seed error:", err);
//     process.exit(1);
//   }
// }
// run();


// backend/seedUser.js
// import "dotenv/config.js";
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// import User from "./models/user.js";
// import Property from "./models/property.js";

// async function main() {
//   if (!process.env.MONGO_URI) {
//     console.error("❌ MONGO_URI missing in .env");
//     process.exit(1);
//   }

//   await mongoose.connect(process.env.MONGO_URI);
//   console.log("✅ Connected to MongoDB");

//   try {
//     // Wipe old (DEV ONLY). Comment these lines in prod.
//     await User.deleteMany({});
//     await Property.deleteMany({});

//     // --- Create sample properties ---
//     const props = await Property.create([
//       {
//         code: "HSE001",
//         name: "Hotel Sunrise",
//         keyPersonName: "Mr. A",
//         contactNo: "0141-123456",
//         mobileNo: "9876543210",
//         email: "sunrise@example.com",
//         location: "Jaipur",
//         country: "India",
//         state: "Rajasthan",
//         city: "Jaipur",
//         address: "MI Road, Jaipur",
//         salesPerson: "Sales A",
//         // optional payments demo
//         payment: {
//           modes: [
//             { mode: "CASH", enabled: true, surchargePct: 0 },
//             { mode: "CARD", enabled: true, surchargePct: 0 },
//             { mode: "UPI",  enabled: true, surchargePct: 0 },
//             { mode: "BANK", enabled: true, surchargePct: 0 },
//           ],
//           bankAccounts: [
//             {
//               label: "Primary Current A/C",
//               accountName: "Hotel Sunrise Pvt Ltd",
//               accountNumber: "1234567890",
//               ifsc: "ICIC0000123",
//               bankName: "ICICI Bank, MI Road",
//               isDefault: true,
//             },
//           ],
//           upi: [{ vpa: "sunrise@icici", displayName: "Front Desk UPI", isDefault: true }],
//           allowPartial: true,
//           minAdvancePct: 0,
//         },
//       },
//       {
//         code: "HSE002",
//         name: "Hotel Sunset",
//         keyPersonName: "Mr. B",
//         contactNo: "0141-987654",
//         mobileNo: "9876501234",
//         email: "sunset@example.com",
//         location: "Udaipur",
//         country: "India",
//         state: "Rajasthan",
//         city: "Udaipur",
//         address: "Lake Pichola, Udaipur",
//         salesPerson: "Sales B",
//       },
//       {
//         code: "HSE003",
//         name: "Hotel Midtown",
//         keyPersonName: "Ms. C",
//         contactNo: "011-22112211",
//         mobileNo: "9999000011",
//         email: "midtown@example.com",
//         location: "Delhi",
//         country: "India",
//         state: "Delhi",
//         city: "New Delhi",
//         address: "Connaught Place",
//         salesPerson: "Sales C",
//       },
//     ]);

//     const allModules = [
//       "bookingEngine",
//       "reservation",
//       "backoffice",
//       "frontdesk",
//       "pos",
//       "housekeeping",
//       "kds",
//       "report",
//       "inventory",
//     ];

//     // --- Superadmin (has all modules on all properties) ---
//     const superPw = "Pass@1234";
//     const superHash = await bcrypt.hash(superPw, 10);

//     const superadmin = await User.create({
//       customerId: "super",
//       name: "Ava Super",
//       passwordHash: superHash,
//       role: "superadmin", // if your model stores this; else rely on memberships role
//       // convenience: top-level modules for Dashboard dynamic checks
//       modules: allModules,
//       // full access to every property
//       memberships: props.map(p => ({
//         propertyCode: p.code,
//         role: "superadmin",
//         modules: allModules,
//       })),
//       isActive: true,
//     });

//     // --- Admin at HSE001 (limited modules) ---
//     const adminPw = "Admin@123";
//     const adminHash = await bcrypt.hash(adminPw, 10);
//     const admin = await User.create({
//       customerId: "admin1",
//       name: "Adam Admin",
//       passwordHash: adminHash,
//       role: "admin",
//       // optional: only if you also read session.modules
//       modules: ["reservation", "frontdesk", "pos", "report", "inventory"],
//       memberships: [
//         {
//           propertyCode: "HSE001",
//           role: "admin",
//           modules: ["reservation", "frontdesk", "pos", "report", "inventory"],
//         },
//       ],
//       isActive: true,
//     });

//     // --- Employee at HSE002 (few modules) ---
//     const empPw = "Emp@123";
//     const empHash = await bcrypt.hash(empPw, 10);
//     const employee = await User.create({
//       customerId: "emp1",
//       name: "Ema Employee",
//       passwordHash: empHash,
//       role: "employee",
//       modules: ["reservation", "frontdesk", "housekeeping"],
//       memberships: [
//         {
//           propertyCode: "HSE002",
//           role: "employee",
//           modules: ["reservation", "frontdesk", "housekeeping"],
//         },
//       ],
//       isActive: true,
//     });

//     console.log("✅ Seed complete");
//     console.log("── Properties:");
//     props.forEach(p => console.log(`   • ${p.code}  ${p.name}`));
//     console.log("── Users:");
//     console.log(`   • superadmin  -> customerId: ${superadmin.customerId}, password: ${superPw}`);
//     console.log(`   • admin       -> customerId: ${admin.customerId},      password: ${adminPw}`);
//     console.log(`   • employee    -> customerId: ${employee.customerId},   password: ${empPw}`);
//   } catch (err) {
//     console.error("❌ Seed error:", err);
//     process.exit(1);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔌 Disconnected");
//   }
// }

// main();


// backend/seedUser.js
import "dotenv/config.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./models/user.js";
import Property from "./models/property.js";

async function hash(pw) {
  return bcrypt.hash(pw, 10);
}

async function createUser({
  customerId,
  name,
  email,        // must be unique & non-null if your User.email has unique index
  mobileNo,
  role,         // 'superadmin' | 'admin' | 'employee' (optional if you rely on memberships)
  password,
  modules = [], // optional top-level convenience
  memberships = [],
  isActive = true,
}) {
  const passwordHash = await hash(password);
  return User.create({
    customerId,
    name,
    email,
    mobileNo,
    role,
    passwordHash,
    modules,
    memberships,
    isActive,
  });
}

async function main() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI missing in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // DEV-ONLY: wipe old data so you can reseed freely
    await User.deleteMany({});
    await Property.deleteMany({});

    // ---------- Properties ----------
    const props = await Property.create([
      {
        code: "HSE001",
        name: "Hotel Sunrise",
        keyPersonName: "Mr. A",
        contactNo: "0141-123456",
        mobileNo: "9876543210",
        email: "sunrise@example.com",
        location: "Jaipur",
        country: "India",
        state: "Rajasthan",
        city: "Jaipur",
        address: "MI Road, Jaipur",
        salesPerson: "Sales A",
        payment: {
          modes: [
            { mode: "CASH", enabled: true, surchargePct: 0 },
            { mode: "CARD", enabled: true, surchargePct: 0 },
            { mode: "UPI",  enabled: true, surchargePct: 0 },
            { mode: "BANK", enabled: true, surchargePct: 0 },
          ],
          bankAccounts: [
            {
              label: "Primary Current A/C",
              accountName: "Hotel Sunrise Pvt Ltd",
              accountNumber: "1234567890",
              ifsc: "ICIC0000123",
              bankName: "ICICI Bank, MI Road",
              isDefault: true,
            },
          ],
          upi: [{ vpa: "sunrise@icici", displayName: "Front Desk UPI", isDefault: true }],
          allowPartial: true,
          minAdvancePct: 0,
        },
      },
      {
        code: "HSE002",
        name: "Hotel Sunset",
        keyPersonName: "Mr. B",
        contactNo: "0141-987654",
        mobileNo: "9876501234",
        email: "sunset@example.com",
        location: "Udaipur",
        country: "India",
        state: "Rajasthan",
        city: "Udaipur",
        address: "Lake Pichola, Udaipur",
        salesPerson: "Sales B",
      },
      {
        code: "HSE003",
        name: "Hotel Midtown",
        keyPersonName: "Ms. C",
        contactNo: "011-22112211",
        mobileNo: "9999000011",
        email: "midtown@example.com",
        location: "Delhi",
        country: "India",
        state: "Delhi",
        city: "New Delhi",
        address: "Connaught Place",
        salesPerson: "Sales C",
      },
    ]);

    const ALL_MODULES = [
      "bookingEngine",
      "reservation",
      "backoffice",
      "frontdesk",
      "pos",
      "housekeeping",
      "kds",
      "report",
      "inventory",
    ];

    // ---------- Users ----------
    // Superadmin – all properties, all modules
    const superadmin = await createUser({
      customerId: "super",
      name: "Ava Super",
      email: "superadmin@demo.local",   // unique & non-null
      mobileNo: "9000000001",
      role: "superadmin",
      password: "Pass@1234",
      modules: ALL_MODULES,             // optional convenience for dashboard
      memberships: props.map((p) => ({
        propertyCode: p.code,
        role: "superadmin",
        modules: ALL_MODULES,
      })),
    });

    // Admin at HSE001 – limited modules
    const admin = await createUser({
      customerId: "admin1",
      name: "Adam Admin",
      email: "admin1@demo.local",       // unique & non-null
      mobileNo: "9000000002",
      role: "admin",
      password: "Admin@123",
      modules: ["reservation", "frontdesk", "pos", "report", "inventory"],
      memberships: [
        {
          propertyCode: "HSE001",
          role: "admin",
          modules: ["reservation", "frontdesk", "pos", "report", "inventory"],
        },
      ],
    });

    // Employee at HSE002 – a few modules
    const employee = await createUser({
      customerId: "emp1",
      name: "Ema Employee",
      email: "employee1@demo.local",    // unique & non-null
      mobileNo: "9000000003",
      role: "employee",
      password: "Emp@123",
      modules: ["reservation", "frontdesk", "housekeeping"],
      memberships: [
        {
          propertyCode: "HSE002",
          role: "employee",
          modules: ["reservation", "frontdesk", "housekeeping"],
        },
      ],
    });

    console.log("✅ Seed complete");
    console.log("── Properties:");
    props.forEach((p) => console.log(`   • ${p.code}  ${p.name}`));
    console.log("── Users:");
    console.log(`   • superadmin  -> customerId: ${superadmin.customerId}, password: Pass@1234`);
    console.log(`   • admin       -> customerId: ${admin.customerId},      password: Admin@123`);
    console.log(`   • employee    -> customerId: ${employee.customerId},   password: Emp@123`);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

main();
