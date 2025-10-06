// backend/routes/roomRoutes.js
import express from "express";
import Room from "../models/room.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/rooms
 * Query: q, page, limit, propertyCode
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
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
        { roomNo: rx },
        { roomTypeCode: rx },
        { status: rx },
        { houseStatus: rx },
        { floor: rx },
      ];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 10));

    const [items, total] = await Promise.all([
      Room.find(where)
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lim)
        .limit(lim)
        .lean(),
      Room.countDocuments(where),
    ]);

    res.json({ data: items, total, page: pg, limit: lim });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/rooms
 * Body: { propertyCode, roomNo, roomTypeCode, floor?, status?, houseStatus?, isActive? }
 */
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body);
    const doc = await Room.create(payload);
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/rooms/:id
 */
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitize(req.body, { partial: true });
    const updated = await Room.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/rooms/:id
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ok = await Room.findByIdAndDelete(req.params.id);
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
  const pick = (k, fn = v => v) => {
    if (body[k] !== undefined) out[k] = fn(body[k]);
  };

  pick("propertyCode", v => String(v).trim().toUpperCase());
  pick("roomNo",       v => String(v).trim());
  pick("roomTypeCode", v => String(v).trim().toUpperCase());
  pick("floor",        v => String(v || "").trim());
  pick("status",       v => String(v || "vacant").trim());
  pick("houseStatus",  v => String(v || "clean").trim());
  pick("isActive",     v => Boolean(v));

  if (!partial) {
    if (!out.propertyCode) throw new Error("propertyCode is required");
    if (!out.roomNo) throw new Error("roomNo is required");
    if (!out.roomTypeCode) throw new Error("roomTypeCode is required");
  }
  return out;
}
