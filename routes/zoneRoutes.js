// routes/zone.js
import express from "express";
import Zone from "../models/Zone.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/zones
 * Query: q, page, limit, propertyCode, areaCode, cityCode, stateCode, isActive
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 20, propertyCode, areaCode, cityCode, stateCode, isActive } = req.query;

    const where = {};
    if (propertyCode) where.propertyCode = String(propertyCode).trim().toUpperCase();
    if (areaCode)     where.areaCode     = String(areaCode).trim().toUpperCase();
    if (cityCode)     where.cityCode     = String(cityCode).trim().toUpperCase();
    if (stateCode)    where.stateCode    = String(stateCode).trim().toUpperCase();
    if (isActive !== undefined && isActive !== "") where.isActive = String(isActive) === "true";

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      where.$or = [{ code: rx }, { name: rx }, { areaCode: rx }, { cityCode: rx }, { stateCode: rx }, { description: rx }];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 20));

    const [items, total] = await Promise.all([
      Zone.find(where).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).lean(),
      Zone.countDocuments(where),
    ]);

    res.json({ data: items, total, page: pg, limit: lim });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/zones
 * Body: { code, name, areaCode, cityCode?, stateCode?, description?, isActive?, propertyCode? }
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const created = await Zone.create(payload);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/zones/:id
 */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await Zone.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/zones/:id
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ok = await Zone.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* helpers */
function sanitize(body, { partial = false } = {}) {
  const out = {};
  const pick = (k, fn = (v) => v) => { if (body[k] !== undefined) out[k] = fn(body[k]); };

  pick("code", (v) => String(v).trim().toUpperCase());
  pick("name", (v) => String(v).trim());
  pick("areaCode", (v) => String(v).trim().toUpperCase());
  pick("cityCode", (v) => String(v || "").trim().toUpperCase());
  pick("stateCode", (v) => String(v || "").trim().toUpperCase());
  pick("description", (v) => String(v || "").trim());
  pick("isActive", (v) => Boolean(v));
  pick("propertyCode", (v) => String(v || "").trim().toUpperCase());

  if (!partial) {
    if (!out.code) throw new Error("Zone code is required");
    if (!out.name) throw new Error("Zone name is required");
    if (!out.areaCode) throw new Error("Area code is required");
  }
  return out;
}

export default router;
