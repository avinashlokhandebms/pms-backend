import express from "express";
import MealPlan from "../models/mealplan.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/mealplans
 * Query: q, page, limit, propertyCode
 */
router.get("/", requireAuth, async (req, res) => {
  const {
    q = "",
    page = 1,
    limit = 10,
    propertyCode,
  } = req.query;

  const where = {};
  if (propertyCode) where.propertyCode = String(propertyCode).toUpperCase();

  if (q) {
    const term = String(q).trim();
    const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    where.$or = [
      { propertyCode: rx },
      { code: rx },
      { name: rx },
      { type: rx },
      { details: rx },
      { description: rx },
      { taxType: rx },
    ];
  }

  const pg = Math.max(1, Number(page) || 1);
  const lim = Math.min(100, Math.max(1, Number(limit) || 10));

  const [items, total] = await Promise.all([
    MealPlan.find(where).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).lean(),
    MealPlan.countDocuments(where),
  ]);

  res.json({ data: items, total, page: pg, limit: lim });
});

/**
 * POST /api/mealplans
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const doc = await MealPlan.create(payload);
    res.json(doc);
  } catch (e) { next(e); }
});

/**
 * PATCH /api/mealplans/:id
 */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await MealPlan.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) { next(e); }
});

/**
 * DELETE /api/mealplans/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  const ok = await MealPlan.findByIdAndDelete(req.params.id);
  if (!ok) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
});

export default router;

/* helpers */
function sanitize(body, { partial = false } = {}) {
  const out = {};
  const pick = (k, fn = v => v) => {
    if (body[k] !== undefined) out[k] = fn(body[k]);
  };

  pick("propertyCode", v => String(v).trim().toUpperCase());
  pick("code",         v => String(v).trim().toUpperCase());
  pick("name",         v => String(v).trim());
  pick("type",         v => String(v).trim());
  pick("details",      v => String(v || ""));
  pick("taxType",      v => String(v).trim().toLowerCase());
  pick("description",  v => String(v || ""));
  pick("isActive",     v => Boolean(v));

  if (!partial) {
    if (!out.propertyCode) throw new Error("propertyCode is required");
    if (!out.code) throw new Error("code is required");
    if (!out.name) throw new Error("name is required");
  }

  return out;
}
