// routes/state.js
import express from "express";
import State from "../models/state.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/states
 * Query: q, page, limit, propertyCode
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 20, propertyCode } = req.query;

    const where = {};
    if (propertyCode) where.propertyCode = String(propertyCode).toUpperCase();

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      where.$or = [{ code: rx }, { name: rx }, { description: rx }, { propertyCode: rx }];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 20));

    const [items, total] = await Promise.all([
      State.find(where).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).lean(),
      State.countDocuments(where),
    ]);

    res.json({ data: items, total, page: pg, limit: lim });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/states
 * Body: { code, name, description?, isActive?, propertyCode? }
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const created = await State.create(payload);
    res.json(created);
  } catch (err) {
    if (isDupKey(err)) {
      return res.status(409).json({ message: "Code already exists for this property." });
    }
    next(err);
  }
});

/**
 * PATCH /api/states/:id
 */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await State.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    if (isDupKey(err)) {
      return res.status(409).json({ message: "Code already exists for this property." });
    }
    next(err);
  }
});

/**
 * DELETE /api/states/:id
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ok = await State.findByIdAndDelete(req.params.id);
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

  pick("propertyCode", (v) => String(v || "").trim().toUpperCase());
  pick("code", (v) => String(v).trim().toUpperCase());
  pick("name", (v) => String(v).trim());
  pick("description", (v) => String(v || "").trim());
  pick("isActive", (v) => Boolean(v));

  if (!partial) {
    if (!out.code) throw new Error("State code is required");
    if (!out.name) throw new Error("State name is required");
    if (out.propertyCode === undefined) out.propertyCode = "";
  }
  return out;
}

function isDupKey(err) {
  return err && (err.code === 11000 || (err.name === "MongoServerError" && err.message?.includes("E11000")));
}
