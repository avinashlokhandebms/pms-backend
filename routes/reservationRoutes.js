import express from "express";
import Reservation from "../models/reservation.js";

const router = express.Router();

/**
 * GET /api/reservations
 * Supports:
 * q, bookingNo, guest, type (Arrival/Departure/Reservation)
 * from, to, company, salesRep, bookedBy, voucher, roomNo, resType, days, filterType
 * page, limit, sort, dir
 */
router.get("/", async (req, res) => {
  try {
    let {
      q = "",
      bookingNo = "",
      guest = "",
      type = "Arrival Date",
      from = "",
      to = "",
      company = "",
      salesRep = "",
      bookedBy = "",
      voucher = "",
      roomNo = "",
      resType = "",
      days = "",
      filterType = "",
      page = 1,
      limit = 20,
      sort = "checkIn",
      dir = "desc",
    } = req.query;

    page = Number(page) || 1;
    limit = Math.min(200, Number(limit) || 20);
    const skip = (page - 1) * limit;

    // ---- Build Mongo filter
    const filter = {};

    // quick search
    if (q) {
      filter.$or = [
        { reservationNo: new RegExp(q, "i") },
        { guestName:     new RegExp(q, "i") },
        { phone:         new RegExp(q, "i") },
        { email:         new RegExp(q, "i") },
        { companyName:   new RegExp(q, "i") },
      ];
    }

    if (bookingNo) filter.reservationNo = new RegExp(bookingNo, "i");
    if (guest) {
      filter.$or = [
        ...(filter.$or || []),
        { guestName: new RegExp(guest, "i") },
        { phone: new RegExp(guest, "i") },
      ];
    }
    if (company) filter.companyName = new RegExp(company, "i");
    if (resType)  filter.reservationMode = new RegExp(resType, "i");

    // date range by "type"
    const rangeField =
      type?.toLowerCase().startsWith("arrival") ? "checkIn" :
      type?.toLowerCase().startsWith("departure") ? "checkOut" :
      "createdAt";

    if (from || to) {
      filter[rangeField] = {};
      if (from) filter[rangeField].$gte = new Date(from);
      if (to)   filter[rangeField].$lte = new Date(to + "T23:59:59.999Z");
    }

    // (placeholders if you later wire them)
    if (salesRep)  filter.salesPerson = new RegExp(salesRep, "i");
    // bookedBy, voucher, roomNo, days, filterType are available if you add fields later

    // ---- Sort map (safety)
    const sortMap = {
      reservationNo: "reservationNo",
      guestName: "guestName",
      companyName: "companyName",
      roomType: "roomType",
      checkIn: "checkIn",
      checkOut: "checkOut",
      nights: "nights",
      rooms: "rooms",
      amount: "amount",
      paid: "paid",
      createdAt: "createdAt",
      status: "status",
    };
    const sortField = sortMap[sort] || "checkIn";
    const sortDir = String(dir).toLowerCase() === "asc" ? 1 : -1;

    const [total, data] = await Promise.all([
      Reservation.countDocuments(filter),
      Reservation.find(filter)
        .sort({ [sortField]: sortDir, _id: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.json({ data, total, page, limit });
  } catch (err) {
    console.error("GET /reservations error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/** GET /api/reservations/:id */
router.get("/:id", async (req, res) => {
  try {
    const r = await Reservation.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Not found" });
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/** POST /api/reservations (create) */
router.post("/", async (req, res) => {
  try {
    const r = new Reservation(req.body);
    await r.save();
    res.status(201).json(r);
  } catch (err) {
    res.status(400).json({ message: err.message || "Bad request" });
  }
});

/** PATCH /api/reservations/:id (update) */
router.patch("/:id", async (req, res) => {
  try {
    const r = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!r) return res.status(404).json({ message: "Not found" });
    res.json(r);
  } catch (err) {
    res.status(400).json({ message: err.message || "Bad request" });
  }
});

/** POST /api/reservations/:id/cancel */
router.post("/:id/cancel", async (req, res) => {
  try {
    const r = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true }
    );
    if (!r) return res.status(404).json({ message: "Not found" });
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/** DELETE /api/reservations/:id */
router.delete("/:id", async (req, res) => {
  try {
    const r = await Reservation.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
