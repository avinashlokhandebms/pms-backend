// import { Router } from "express";
// import bcrypt from "bcryptjs";
// import User from "../models/user.js";

// // If you have these middlewares, keep them on:
// import { requireAuth } from "../middleware/requireAuth.js";
// import { requireRole } from "../middleware/requireRole.js";

// const router = Router();

// // GET /api/users?q=&page=1&limit=10
// router.get("/", requireAuth, requireRole("superadmin"), async (req, res) => {
//   try {
//     let { q = "", page = 1, limit = 10 } = req.query;
//     page = Number(page) || 1;
//     limit = Math.min(200, Number(limit) || 10);
//     const skip = (page - 1) * limit;

//     const filter = {};
//     if (q) {
//       const re = new RegExp(String(q).trim(), "i");
//       filter.$or = [
//         { customerId: re },
//         { name: re },
//         { email: re },
//         { mobileNo: re },
//         { "memberships.propertyCode": re },
//         { "memberships.role": re },
//       ];
//     }

//     const [total, data] = await Promise.all([
//       User.countDocuments(filter),
//       User.find(filter)
//         .sort({ createdAt: -1, _id: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//     ]);

//     res.json({ data, total, page, limit });
//   } catch (err) {
//     console.error("GET /api/users error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // POST /api/users  (create)
// router.post("/", requireAuth, requireRole("superadmin"), async (req, res) => {
//   try {
//     const {
//       customerId, name, email, mobileNo,
//       password, isActive = true, memberships = [],
//     } = req.body;

//     if (!customerId || !name || !password) {
//       return res.status(400).json({ message: "customerId, name and password are required" });
//     }

//     const passwordHash = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       customerId,
//       name,
//       email: email || undefined,
//       mobileNo: mobileNo || undefined,
//       passwordHash,
//       isActive,
//       memberships: (memberships || []).map(m => ({
//         propertyCode: String(m.propertyCode || "").toUpperCase(),
//         role: m.role || "employee",
//         modules: Array.isArray(m.modules) ? m.modules : ["reservation"],
//       })),
//     });

//     res.status(201).json(user);
//   } catch (err) {
//     const msg =
//       err?.code === 11000
//         ? `Duplicate key: ${Object.keys(err.keyPattern || {}).join(", ")}`
//         : err?.message || "Bad request";
//     res.status(400).json({ message: msg });
//   }
// });

// // PATCH /api/users/:id  (update)
// router.patch("/:id", requireAuth, requireRole("superadmin"), async (req, res) => {
//   try {
//     const update = { ...req.body };

//     if (update.password) {
//       update.passwordHash = await bcrypt.hash(update.password, 10);
//       delete update.password;
//     }

//     if (Array.isArray(update.memberships)) {
//       update.memberships = update.memberships.map(m => ({
//         propertyCode: String(m.propertyCode || "").toUpperCase(),
//         role: m.role || "employee",
//         modules: Array.isArray(m.modules) ? m.modules : ["reservation"],
//       }));
//     }

//     const doc = await User.findByIdAndUpdate(req.params.id, update, {
//       new: true,
//       runValidators: true,
//     });
//     if (!doc) return res.status(404).json({ message: "Not found" });
//     res.json(doc);
//   } catch (err) {
//     const msg =
//       err?.code === 11000
//         ? `Duplicate key: ${Object.keys(err.keyPattern || {}).join(", ")}`
//         : err?.message || "Bad request";
//     res.status(400).json({ message: msg });
//   }
// });

// // DELETE /api/users/:id
// router.delete("/:id", requireAuth, requireRole("superadmin"), async (req, res) => {
//   try {
//     const del = await User.findByIdAndDelete(req.params.id);
//     if (!del) return res.status(404).json({ message: "Not found" });
//     res.json({ ok: true });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;


import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

const router = Router();

// All endpoints require token + superadmin (adjust if you want admins to read)
router.use(requireAuth, requireRole("superadmin"));

/** GET /api/users?q=&page=&limit= */
router.get("/", async (req, res, next) => {
  try {
    let { q = "", page = 1, limit = 20 } = req.query;
    page = Number(page) || 1;
    limit = Math.min(200, Number(limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { };
    if (q) {
      const re = new RegExp(String(q).trim(), "i");
      filter.$or = [
        { customerId: re }, { name: re }, { email: re }, { mobileNo: re },
        { "memberships.propertyCode": re }, { "memberships.role": re }
      ];
    }

    const [total, data] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit)
    ]);
    res.json({ data, total, page, limit });
  } catch (e) { next(e); }
});

/** GET /api/users/:id */
router.get("/:id", async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "Not found" });
    res.json(u);
  } catch (e) { next(e); }
});

/** POST /api/users  { customerId, name, email?, mobileNo?, password, isActive?, memberships[] } */
router.post("/", async (req, res, next) => {
  try {
    const { password, ...rest } = req.body || {};
    if (!password) return res.status(400).json({ message: "Password required" });

    const passwordHash = await bcrypt.hash(password, 10);
    const doc = await User.create({ ...rest, passwordHash });
    res.status(201).json(doc);
  } catch (e) {
    if (e?.code === 11000) e.status = 400; // dup keys
    next(e);
  }
});

/** PATCH /api/users/:id  (password optional) */
router.patch("/:id", async (req, res, next) => {
  try {
    const patch = { ...req.body };
    if (patch.password) {
      patch.passwordHash = await bcrypt.hash(patch.password, 10);
      delete patch.password;
    }
    const updated = await User.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) {
    if (e?.code === 11000) e.status = 400;
    next(e);
  }
});

/** DELETE /api/users/:id */
router.delete("/:id", async (req, res, next) => {
  try {
    const del = await User.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
