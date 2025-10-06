import express from "express";
import IdentityDetail from "../models/IdentityDetail.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/identities
 * Query: q, page, limit, propertyCode
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 20, propertyCode } = req.query;

    const where = {};
    if (propertyCode) where.propertyCode = String(propertyCode).toUpperCase();
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      where.$or = [
        { code: rx }, { name: rx }, { description: rx }, { maskPattern: rx }
      ];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 20));

    const [items, total] = await Promise.all([
      IdentityDetail.find(where).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim).lean(),
      IdentityDetail.countDocuments(where),
    ]);

    res.json({ data: items, total, page: pg, limit: lim });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/identities/:id
 */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await IdentityDetail.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/identities
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const created = await IdentityDetail.create(payload);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/identities/:id
 */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await IdentityDetail.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/identities/:id
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ok = await IdentityDetail.findByIdAndDelete(req.params.id);
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
  pick("code",         (v) => String(v).trim().toUpperCase());
  pick("name",         (v) => String(v).trim());
  pick("maskPattern",  (v) => String(v || "").trim());
  pick("formatRegex",  (v) => String(v || "").trim());
  pick("requiresNumber",     (v) => Boolean(v));
  pick("requiresExpiryDate", (v) => Boolean(v));
  pick("requiresIssuePlace", (v) => Boolean(v));
  pick("isGovtId",           (v) => Boolean(v));
  pick("description",  (v) => String(v || "").trim());
  pick("isActive",     (v) => Boolean(v));

  if (!partial) {
    if (!out.code) throw new Error("Identity code is required");
    if (!out.name) throw new Error("Identity name is required");
  }

  // Optional: check regex compiles (if provided)
  if (out.formatRegex) {
    try { new RegExp(out.formatRegex); }
    catch { throw new Error("formatRegex is not a valid RegExp pattern"); }
  }
  return out;
}
