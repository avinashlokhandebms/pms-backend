// backend/routes/salespersonRoutes.js
import express from "express";
import SalesPerson from "../models/salesperson.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/salespersons
 * Query: q, page, limit
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 10 } = req.query;

    const where = {};
    if (q) {
      const term = String(q).trim();
      const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      where.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 10));

    const [items, total] = await Promise.all([
      SalesPerson.find(where)
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lim)
        .limit(lim)
        .lean(),
      SalesPerson.countDocuments(where),
    ]);

    res.json({ data: items, total, page: pg, limit: lim });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/salespersons
 * Body: { name, email?, phone?, isActive? }
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const doc = await SalesPerson.create(payload);
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/salespersons/:id
 */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await SalesPerson.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/salespersons/:id
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ok = await SalesPerson.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;

/* ---------- helpers ---------- */
function sanitize(body, { partial = false } = {}) {
  const out = {};
  const pick = (k, fn = (v) => v) => {
    if (body[k] !== undefined) out[k] = fn(body[k]);
  };

  pick("name", (v) => String(v).trim());
  pick("email", (v) => String(v || "").trim().toLowerCase());
  pick("phone", (v) => String(v || "").trim());
  pick("isActive", (v) => Boolean(v));

  if (!partial) {
    if (!out.name) throw new Error("name is required");
  }
  return out;
}
