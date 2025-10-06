// routes/billingInstructions.js
import express from "express";
import BillingInstruction from "../models/BillingInstruction.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/** Helpers */
function sanitize(body, { partial = false } = {}) {
  const out = {};
  const pick = (k, fn = (v) => v) => {
    if (body[k] !== undefined) out[k] = fn(body[k]);
  };

  pick("propertyCode", (v) => String(v || "").trim().toUpperCase());
  pick("code", (v) => String(v).trim().toUpperCase());
  pick("title", (v) => String(v).trim());
  pick("description", (v) => String(v || "").trim());
  pick("isActive", (v) => Boolean(v));

  if (!partial) {
    if (!out.code) throw new Error("Code is required");
    if (!out.title) throw new Error("Title is required");
  }
  return out;
}

function normalizeQuery(q) {
  const s = String(q || "");
  if (!s) return null;
  // Escape regex tokens
  return new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

function dupKeyToMsg(err) {
  // Mongoose 6/7 dup key error
  if (err && err.code === 11000) {
    return "Billing Instruction with same Property/Code already exists.";
  }
  return err?.message || "Unexpected error";
}

/** GET /api/billinginstructions
 * Query: q, page, limit, propertyCode
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 20, propertyCode } = req.query;

    const where = {};
    if (propertyCode) where.propertyCode = String(propertyCode).toUpperCase();

    const rx = normalizeQuery(q);
    if (rx) where.$or = [{ code: rx }, { title: rx }, { description: rx }];

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 20));

    const [items, total] = await Promise.all([
      BillingInstruction.find(where)
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lim)
        .limit(lim)
        .lean(),
      BillingInstruction.countDocuments(where),
    ]);

    res.json({ data: items, total, page: pg, limit: lim });
  } catch (err) {
    next(err);
  }
});

/** GET /api/billinginstructions/:id */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await BillingInstruction.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/** POST /api/billinginstructions */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const created = await BillingInstruction.create(payload);
    res.status(201).json(created);
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: dupKeyToMsg(err) });
    next(err);
  }
});

/** PATCH /api/billinginstructions/:id */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await BillingInstruction.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: dupKeyToMsg(err) });
    next(err);
  }
});

/** DELETE /api/billinginstructions/:id */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ok = await BillingInstruction.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
