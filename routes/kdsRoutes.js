import express from "express";
import KDSSetting from "../models/KDSsetting.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/kdssettings
 * Query: q, page, limit, propertyCode
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 10, propertyCode } = req.query;

    const where = {};
    if (propertyCode) where.propertyCode = String(propertyCode).toUpperCase();

    if (q) {
      const term = String(q).trim();
      const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      where.$or = [{ name: rx }, { displayLocation: rx }, { printer: rx }];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 10));

    const [items, total] = await Promise.all([
      KDSSetting.find(where).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).lean(),
      KDSSetting.countDocuments(where),
    ]);

    res.json({ data: items, total, page: pg, limit: lim });
  } catch (err) { next(err); }
});

/**
 * POST /api/kdssettings
 * Body: { name, displayLocation?, printer?, isActive?, propertyCode? }
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const created = await KDSSetting.create(payload);
    res.json(created);
  } catch (err) { next(err); }
});

/**
 * PATCH /api/kdssettings/:id
 */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await KDSSetting.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

/**
 * DELETE /api/kdssettings/:id
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ok = await KDSSetting.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;

/* ---------- helpers ---------- */
function sanitize(body, { partial = false } = {}) {
  const out = {};
  const pick = (k, fn = v => v) => { if (body[k] !== undefined) out[k] = fn(body[k]); };

  pick("name",            v => String(v).trim());
  pick("displayLocation", v => String(v || "").trim());
  pick("printer",         v => String(v || "").trim());
  pick("isActive",        v => Boolean(v));
  pick("propertyCode",    v => String(v || "").trim().toUpperCase());

  if (!partial) {
    if (!out.name) throw new Error("name is required");
  }
  return out;
}
