// routes/pickDropFacilityRoutes.js
import express from "express";
import PickDropFacility from "../models/PickDropFacility.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/pickdropfacilities
 * Query: q, page, limit, propertyCode
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 20, propertyCode } = req.query;

    const where = {};
    if (propertyCode) where.propertyCode = String(propertyCode).toUpperCase();

    if (q) {
      // escape regex specials safely
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      where.$or = [
        { code: rx },
        { name: rx },
        { type: rx },
        { description: rx },
        { propertyCode: rx },
      ];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 20));

    const [items, total] = await Promise.all([
      PickDropFacility.find(where)
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lim)
        .limit(lim)
        .lean(),
      PickDropFacility.countDocuments(where),
    ]);

    res.json({ data: items, total, page: pg, limit: lim });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/pickdropfacilities/:id
 */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await PickDropFacility.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/pickdropfacilities
 * Body: { propertyCode?, code, name, type?, description?, isActive? }
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const created = await PickDropFacility.create(payload);
    res.status(201).json(created);
  } catch (err) {
    if (err?.code === 11000) {
      // duplicate (propertyCode, code)
      return res
        .status(409)
        .json({ error: "Facility code already exists for this property." });
    }
    next(err);
  }
});

/**
 * PATCH /api/pickdropfacilities/:id
 */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await PickDropFacility.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ error: "Facility code already exists for this property." });
    }
    next(err);
  }
});

/**
 * DELETE /api/pickdropfacilities/:id
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ok = await PickDropFacility.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;

/* ---------- helpers ---------- */
function sanitize(body, { partial = false } = {}) {
  const out = {};
  const pick = (k, fn = (v) => v) => {
    if (body[k] !== undefined) out[k] = fn(body[k]);
  };

  pick("propertyCode", (v) => String(v || "").trim().toUpperCase());
  pick("code", (v) => String(v).trim().toUpperCase());
  pick("name", (v) => String(v).trim());
  pick("type", (v) => String(v || "BOTH").trim().toUpperCase());
  pick("description", (v) => String(v || "").trim());
  pick("isActive", (v) => Boolean(v));

  if (!partial) {
    if (!out.code) throw new Error("Facility code is required");
    if (!out.name) throw new Error("Facility name is required");
    // normalize type default
    if (!out.type) out.type = "BOTH";
  }
  return out;
}
