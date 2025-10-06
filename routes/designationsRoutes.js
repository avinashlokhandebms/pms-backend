import express from "express";
import Designation from "../models/Designation.js";

const router = express.Router();

/* ---- GET all with pagination/search ---- */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, q = "" } = req.query;
    const filter = q
      ? { $or: [{ title: new RegExp(q, "i") }, { description: new RegExp(q, "i") }] }
      : {};

    const [data, total] = await Promise.all([
      Designation.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Designation.countDocuments(filter),
    ]);

    res.json({ data, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---- GET by ID ---- */
router.get("/:id", async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id);
    if (!designation) return res.status(404).json({ error: "Not found" });
    res.json(designation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---- CREATE ---- */
router.post("/", async (req, res) => {
  try {
    const designation = new Designation(req.body);
    await designation.save();
    res.status(201).json(designation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ---- UPDATE ---- */
router.patch("/:id", async (req, res) => {
  try {
    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!designation) return res.status(404).json({ error: "Not found" });
    res.json(designation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ---- DELETE ---- */
router.delete("/:id", async (req, res) => {
  try {
    const designation = await Designation.findByIdAndDelete(req.params.id);
    if (!designation) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
