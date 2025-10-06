// routes/versions.js
import express from "express";
import Version from "../models/version.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/versions
 * Query: q, page, limit, propertyCode, isActive
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 20, propertyCode, isActive } = req.query;

    const where = {};
    if (propertyCode !== undefined) where.propertyCode = String(propertyCode || "").toUpperCase();
    if (isActive !== undefined && isActive !== "") {
      // accept "true"/"false"/1/0
      where.isActive = /^(1|true)$/i.test(String(isActive));
    }

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      where.$or = [{ code: rx }, { name: rx }, { description: rx }];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 20));

    const [items, total] = await Promise.all([
      Version.find(where).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).lean(),
      Version.countDocuments(where),
    ]);

    res.json({ data: items, total, page: pg, limit: lim });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/versions/:id
 */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await Version.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/versions
 * Body: { code, name, description?, isActive?, propertyCode? }
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const created = await Version.create(payload);
    res.json(created);
  } catch (err) {
    // Duplicate key handling
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Version code already exists for this property." });
    }
    next(err);
  }
});

/**
 * PATCH /api/versions/:id
 */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await Version.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Version code already exists for this property." });
    }
    next(err);
  }
});

/**
 * DELETE /api/versions/:id
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ok = await Version.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;

/* ---------- helpers ---------- */
function sanitize(body, { partial = false } = {}) {
  const out = {};
  const pick = (k, fn = (v) => v) => { if (body[k] !== undefined) out[k] = fn(body[k]); };

  pick("code", (v) => String(v).trim().toUpperCase());
  pick("name", (v) => String(v).trim());
  pick("description", (v) => String(v || "").trim());
  pick("isActive", (v) => Boolean(v));
  pick("propertyCode", (v) => String(v || "").trim().toUpperCase());

  if (!partial) {
    if (!out.code) throw new Error("Code is required");
    if (!out.name) throw new Error("Name is required");
  }
  return out;
}
