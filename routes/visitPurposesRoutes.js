import express from "express";
import VisitPurpose from "../models/VisitPurpose.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// GET /api/visitpurposes - Get all visit purposes with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const {
      q, // search query
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};

    // Text search across multiple fields
    if (q) {
      const searchRegex = new RegExp(q, "i");
      filter.$or = [
        { code: searchRegex },
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const visitPurposes = await VisitPurpose.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await VisitPurpose.countDocuments(filter);

    res.json({
      data: visitPurposes,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error("Error fetching visit purposes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/visitpurposes/:id - Get a single visit purpose by ID
router.get("/:id", async (req, res) => {
  try {
    const visitPurpose = await VisitPurpose.findById(req.params.id);
    if (!visitPurpose) {
      return res.status(404).json({ message: "Visit purpose not found" });
    }
    res.json(visitPurpose);
  } catch (error) {
    console.error("Error fetching visit purpose:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/visitpurposes - Create a new visit purpose
router.post("/", async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      isActive = true
    } = req.body;

    // Check if visit purpose with same code already exists
    const existingPurpose = await VisitPurpose.findOne({ 
      code: code.toUpperCase() 
    });
    
    if (existingPurpose) {
      return res.status(400).json({ message: "Visit purpose with this code already exists" });
    }

    const visitPurpose = new VisitPurpose({
      code: code.toUpperCase(),
      name: name.trim(),
      description: description || "",
      isActive
    });

    const savedPurpose = await visitPurpose.save();
    res.status(201).json(savedPurpose);
  } catch (error) {
    console.error("Error creating visit purpose:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", error: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PATCH /api/visitpurposes/:id - Update a visit purpose
router.patch("/:id", async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      isActive
    } = req.body;

    // Check if code is being changed and if it conflicts with another purpose
    if (code) {
      const existingPurpose = await VisitPurpose.findOne({
        code: code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingPurpose) {
        return res.status(400).json({ message: "Another visit purpose with this code already exists" });
      }
    }

    const updateData = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPurpose = await VisitPurpose.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPurpose) {
      return res.status(404).json({ message: "Visit purpose not found" });
    }

    res.json(updatedPurpose);
  } catch (error) {
    console.error("Error updating visit purpose:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", error: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/visitpurposes/:id - Delete a visit purpose
router.delete("/:id", async (req, res) => {
  try {
    const deletedPurpose = await VisitPurpose.findByIdAndDelete(req.params.id);
    if (!deletedPurpose) {
      return res.status(404).json({ message: "Visit purpose not found" });
    }
    res.json({ message: "Visit purpose deleted successfully" });
  } catch (error) {
    console.error("Error deleting visit purpose:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;