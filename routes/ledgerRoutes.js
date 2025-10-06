import express from "express";
import Ledger from "../models/ledger.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/ledgers
 * Query: q, page, limit, propertyCode
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 20, propertyCode } = req.query;

    const where = {};
    if (propertyCode) where.propertyCode = String(propertyCode).toUpperCase();

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      where.$or = [{ code: rx }, { name: rx }, { group: rx }, { description: rx }];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 20));

    const [items, total] = await Promise.all([
      Ledger.find(where).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).lean(),
      Ledger.countDocuments(where),
    ]);

    res.json({ data: items, total, page: pg, limit: lim });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ledgers
 * Body: { code, name, group?, description?, isActive?, propertyCode? }
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const created = await Ledger.create(payload);
    res.json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/ledgers/:id
 */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await Ledger.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/ledgers/:id
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ok = await Ledger.findByIdAndDelete(req.params.id);
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
  pick("group", (v) => String(v || "").trim());
  pick("description", (v) => String(v || "").trim());
  pick("isActive", (v) => Boolean(v));
  pick("propertyCode", (v) => String(v || "").trim().toUpperCase());

  if (!partial) {
    if (!out.code) throw new Error("Ledger code is required");
    if (!out.name) throw new Error("Ledger name is required");
  }
  return out;
}
