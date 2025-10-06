// routes/city.js
import express from "express";
import City from "./models/City.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/cities
 * Query: q, page, limit, propertyCode, stateCode, isActive
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 20, propertyCode, stateCode, isActive } = req.query;

    const where = {};
    if (propertyCode) where.propertyCode = String(propertyCode).trim().toUpperCase();
    if (stateCode) where.stateCode = String(stateCode).trim().toUpperCase();
    if (isActive !== undefined && isActive !== "") where.isActive = String(isActive) === "true";

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      where.$or = [{ code: rx }, { name: rx }, { stateCode: rx }, { description: rx }];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 20));

    const [items, total] = await Promise.all([
      City.find(where).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).lean(),
      City.countDocuments(where),
    ]);

    res.json({ data: items, total, page: pg, limit: lim });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cities
 * Body: { code, name, stateCode, description?, isActive?, propertyCode? }
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const created = await City.create(payload);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/cities/:id
 */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await City.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cities/:id
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ok = await City.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ---------- helpers ---------- */
function sanitize(body, { partial = false } = {}) {
  const out = {};
  const pick = (k, fn = (v) => v) => { if (body[k] !== undefined) out[k] = fn(body[k]); };

  pick("code", (v) => String(v).trim().toUpperCase());
  pick("name", (v) => String(v).trim());
  pick("stateCode", (v) => String(v).trim().toUpperCase());
  pick("description", (v) => String(v || "").trim());
  pick("isActive", (v) => Boolean(v));
  pick("propertyCode", (v) => String(v || "").trim().toUpperCase());

  if (!partial) {
    if (!out.code) throw new Error("City code is required");
    if (!out.name) throw new Error("City name is required");
    if (!out.stateCode) throw new Error("State code is required");
  }
  return out;
}

export default router;
