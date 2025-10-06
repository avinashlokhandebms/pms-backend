import express from "express";
import RoomType from "../models/roomtype.js";
import { requireAuth } from "../middleware/requireAuth.js"; // <-- fixed

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const list = await RoomType.find().lean();
    res.json({ data: list, total: list.length });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const saved = await RoomType.create(req.body);
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message || "Bad request" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const updated = await RoomType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Bad request" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await RoomType.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
