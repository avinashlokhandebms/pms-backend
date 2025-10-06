// backend/controllers/reservationController.js
import Reservation from "../models/reservation.js";

// POST /api/reservations
export async function createReservation(req, res) {
  try {
    const body = req.body || {};

    // You can derive propertyCode from auth later; for now accept from body
    if (!body.propertyCode) {
      return res.status(400).json({ error: "propertyCode is required" });
    }

    // basic calc if not sent
    const nights =
      body.nights ??
      Math.max(
        0,
        Math.round((new Date(body.checkOut) - new Date(body.checkIn)) / (1000 * 60 * 60 * 24))
      );

    const amount = body.amount ?? Number(body.rate || 0) * Number(nights || 0);

    const doc = await Reservation.create({
      ...body,
      nights,
      amount,
      reservationNo:
        body.reservationNo ||
        `RSV-${body.propertyCode}-${Date.now().toString().slice(-6)}`,
    });

    res.status(201).json({ ok: true, reservation: doc });
  } catch (err) {
    console.error("createReservation error:", err);
    res.status(500).json({ error: err.message || "Failed to create reservation" });
  }
}

// GET /api/reservations
export async function listReservations(req, res) {
  try {
    const { propertyCode } = req.query; // optional filter
    const q = propertyCode ? { propertyCode } : {};
    const rows = await Reservation.find(q).sort({ createdAt: -1 }).limit(200);
    res.json({ ok: true, reservations: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch reservations" });
  }
}

// GET /api/reservations/:id
export async function getReservation(req, res) {
  try {
    const row = await Reservation.findById(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, reservation: row });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch reservation" });
  }
}

// PATCH /api/reservations/:id
export async function updateReservation(req, res) {
  try {
    const update = req.body || {};
    const row = await Reservation.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, reservation: row });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update reservation" });
  }
}

// DELETE /api/reservations/:id
export async function deleteReservation(req, res) {
  try {
    const row = await Reservation.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete reservation" });
  }
}
