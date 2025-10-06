// // backend/routes/propertyRoutes.js
// import { Router } from "express";
// import { grantMembershipController } from "../controllers/propertyController.js";
// import { requireAuth } from "../middleware/requireAuth.js";
// import { requireRole } from "../middleware/requireRole.js";

// const router = Router();

// router.post("/grant", requireAuth, requireRole("superadmin"), grantMembershipController);

// export default router;



import { Router } from "express";
import Property from "../models/property.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

const router = Router();

// Everything here requires token; superadmin for write
router.use(requireAuth);

/** GET /api/properties?q=&page=&limit= */
router.get("/", async (req, res, next) => {
  try {
    let { q = "", page = 1, limit = 20, sort = "createdAt", dir = "desc" } = req.query;
    page = Number(page) || 1;
    limit = Math.min(200, Number(limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (q) {
      const re = new RegExp(String(q).trim(), "i");
      filter.$or = [{ code: re }, { name: re }, { email: re }, { mobileNo: re }, { keyPersonName: re }];
    }

    const sortField = ["code", "name", "createdAt", "updatedAt"].includes(sort) ? sort : "createdAt";
    const sortDir = String(dir).toLowerCase() === "asc" ? 1 : -1;

    const [total, data] = await Promise.all([
      Property.countDocuments(filter),
      Property.find(filter).sort({ [sortField]: sortDir, _id: -1 }).skip(skip).limit(limit),
    ]);

    res.json({ data, total, page, limit });
  } catch (e) { next(e); }
});

/** GET /api/properties/:id */
router.get("/:id", async (req, res, next) => {
  try {
    const p = await Property.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (e) { next(e); }
});

/** POST /api/properties  (superadmin) */
router.post("/", requireRole("superadmin"), async (req, res, next) => {
  try {
    if (req.body.code) req.body.code = String(req.body.code).trim().toUpperCase();
    const created = await Property.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    if (e?.code === 11000) {
      e.status = 400; e.message = `Property code "${req.body?.code}" already exists`;
    }
    next(e);
  }
});

/** PATCH /api/properties/:id  (superadmin) */
router.patch("/:id", requireRole("superadmin"), async (req, res, next) => {
  try {
    if (req.body.code) req.body.code = String(req.body.code).trim().toUpperCase();
    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) {
    if (e?.code === 11000) {
      e.status = 400; e.message = `Property code "${req.body?.code}" already exists`;
    }
    next(e);
  }
});

/** DELETE /api/properties/:id  (superadmin) */
router.delete("/:id", requireRole("superadmin"), async (req, res, next) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
