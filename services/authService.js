// // backend/services/authService.js
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/user.js";
// import Property from "../models/property.js";

// const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// export async function loginService({ customerId, password, propertyCode }) {
//   const user = await User.findOne({ customerId }).lean();
//   if (!user) {
//     const e = new Error("Invalid credentials");
//     e.status = 401;
//     throw e;
//   }

//   const ok = await bcrypt.compare(password, user.passwordHash);
//   if (!ok) {
//     const e = new Error("Invalid credentials");
//     e.status = 401;
//     throw e;
//   }

//   if (!propertyCode) {
//     const properties = user.memberships.map(m => ({
//       propertyCode: m.propertyCode,
//       role: m.role,
//     }));
//     return {
//       chooseProperty: true,
//       properties,
//       user: { name: user.name, customerId: user.customerId },
//     };
//   }

//   const mem = user.memberships.find(m => m.propertyCode === propertyCode);
//   if (!mem) {
//     const e = new Error("You don’t have access to this property.");
//     e.status = 403;
//     throw e;
//   }

//   const payload = {
//     sub: user._id.toString(),
//     customerId: user.customerId,
//     propertyCode: mem.propertyCode,
//     role: mem.role,
//   };
//   const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

//   const propDoc = await Property.findOne({ code: mem.propertyCode }).lean();
//   return {
//     token,
//     user: {
//       name: user.name,
//       customerId: user.customerId,
//       propertyCode: mem.propertyCode,
//       propertyName: propDoc?.name || mem.propertyCode,
//       role: mem.role,
//     },
//   };
// }

// export async function changePasswordService({ userId, currentPassword, newPassword }) {
//   const user = await User.findById(userId);
//   if (!user) {
//     const e = new Error("User not found");
//     e.status = 404;
//     throw e;
//   }

//   const ok = await bcrypt.compare(currentPassword, user.passwordHash);
//   if (!ok) {
//     const e = new Error("Invalid current password");
//     e.status = 400;
//     throw e;
//   }

//   user.passwordHash = await bcrypt.hash(newPassword, 10);
//   await user.save();
//   return { ok: true, message: "Password changed successfully" };
// }
// backend/services/authService.js
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/user.js";
// import Property from "../models/property.js";

// const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// /** Global catalog (what the app can render) */
// const ALL_MODULES = [
//   "bookingEngine",
//   "reservation",
//   "backoffice",
//   "frontdesk",
//   "pos",
//   "housekeeping",
//   "kds",
//   "report",
//   "inventory",
// ];

// /** Reasonable defaults if a membership has no explicit modules */
// const ROLE_DEFAULTS = {
//   superadmin: ALL_MODULES,
//   admin: ["bookingEngine","reservation","frontdesk","pos","housekeeping","kds","report","inventory"],
//   employee: ["reservation","frontdesk","housekeeping"],
// };

// export async function loginService({ customerId, password, propertyCode }) {
//   // 1) Find user
//   const user = await User.findOne({ customerId }).lean();
//   if (!user) {
//     const e = new Error("Invalid credentials");
//     e.status = 401;
//     throw e;
//   }
//   if (user.isActive === false) {
//     const e = new Error("User is inactive");
//     e.status = 403;
//     throw e;
//   }

//   // 2) Password check
//   const ok = await bcrypt.compare(password, user.passwordHash || "");
//   if (!ok) {
//     const e = new Error("Invalid credentials");
//     e.status = 401;
//     throw e;
//   }

//   // Normalize code if provided
//   const reqCode = propertyCode ? String(propertyCode).trim().toUpperCase() : null;

//   // 3) If property was not chosen yet, return list to pick from
//   if (!reqCode) {
//     const properties = (user.memberships || []).map((m) => ({
//       propertyCode: m.propertyCode,
//       role: m.role,
//       modules: m.modules && m.modules.length ? m.modules : ROLE_DEFAULTS[m.role] || [],
//     }));
//     return {
//       chooseProperty: true,
//       properties,
//       user: { name: user.name, customerId: user.customerId, role: user.role || undefined },
//     };
//   }

//   // 4) Resolve membership for the requested property
//   let membership =
//     (user.memberships || []).find(
//       (m) => String(m.propertyCode).toUpperCase() === reqCode
//     ) || null;

//   const topLevelRole = user.role || "employee";

//   // Superadmin: allow access even without explicit membership
//   if (!membership && topLevelRole === "superadmin") {
//     membership = { propertyCode: reqCode, role: "superadmin", modules: ALL_MODULES };
//   }

//   if (!membership) {
//     const e = new Error("You don’t have access to this property.");
//     e.status = 403;
//     throw e;
//   }

//   // 5) Compute active modules for this session
//   const activeModules =
//     (Array.isArray(membership.modules) && membership.modules.length
//       ? membership.modules
//       : ROLE_DEFAULTS[membership.role || topLevelRole]) || [];

//   // 6) JWT
//   const payload = {
//     sub: user._id.toString(),
//     customerId: user.customerId,
//     propertyCode: membership.propertyCode,
//     role: membership.role || topLevelRole,
//   };
//   const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

//   // 7) Property name (for UI header)
//   const propDoc = await Property.findOne({ code: membership.propertyCode }).lean();

//   // 8) Response the frontend stores in session (Dashboard reads activeModules)
//   return {
//     token,
//     user: {
//       name: user.name,
//       customerId: user.customerId,
//       role: membership.role || topLevelRole,
//       propertyCode: membership.propertyCode,
//       propertyName: propDoc?.name || membership.propertyCode,
//       activeModules, // <-- critical for tiles
//     },
//   };
// }

// export async function changePasswordService({ userId, currentPassword, newPassword }) {
//   const user = await User.findById(userId);
//   if (!user) {
//     const e = new Error("User not found");
//     e.status = 404;
//     throw e;
//   }

//   const ok = await bcrypt.compare(currentPassword, user.passwordHash || "");
//   if (!ok) {
//     const e = new Error("Invalid current password");
//     e.status = 400;
//     throw e;
//   }

//   user.passwordHash = await bcrypt.hash(newPassword, 10);
//   await user.save();
//   return { ok: true, message: "Password changed successfully" };
// }



import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Property from "../models/property.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function loginService({ customerId, password, propertyCode }) {
  const user = await User.findOne({ customerId, isActive: true }).lean();
  if (!user) {
    const e = new Error("Invalid credentials");
    e.status = 401;
    throw e;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const e = new Error("Invalid credentials");
    e.status = 401;
    throw e;
  }

  // If no property selected, return list of properties user can pick
  if (!propertyCode) {
    const properties = (user.memberships || []).map(m => ({
      propertyCode: m.propertyCode,
      role: m.role,
    }));
    return {
      chooseProperty: true,
      properties,
      user: { name: user.name, customerId: user.customerId },
    };
  }

  const mem = (user.memberships || []).find(m => m.propertyCode === String(propertyCode).toUpperCase());
  if (!mem) {
    const e = new Error("You don’t have access to this property.");
    e.status = 403;
    throw e;
  }

  const propDoc = await Property.findOne({ code: mem.propertyCode }).lean();

  const payload = {
    sub: String(user._id),
    customerId: user.customerId,
    propertyCode: mem.propertyCode,
    role: mem.role,
    // optional: pass modules for quick client checks
    modules: Array.isArray(mem.modules) ? mem.modules : [],
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: {
      name: user.name,
      customerId: user.customerId,
      propertyCode: mem.propertyCode,
      propertyName: propDoc?.name || mem.propertyCode,
      role: mem.role,
      modules: payload.modules,
    },
  };
}

export async function changePasswordService({ userId, currentPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    const e = new Error("Invalid current password");
    e.status = 400;
    throw e;
  }
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return { ok: true, message: "Password changed successfully" };
}
