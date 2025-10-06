// backend/seedRoomTypes.js
import "dotenv/config.js";
import mongoose from "mongoose";
import RoomType from "./models/roomtype.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { autoIndex: true });
    console.log("✅ Connected to MongoDB");

    // Clear old demo data (dev only)
    await RoomType.deleteMany({});

    const demo = [
      {
        propertyCode: "HSE001",
        code: "STD",
        name: "Standard Room",
        description: "Basic room with queen bed and attached bath",
        capacity: 2,
      },
      {
        propertyCode: "HSE001",
        code: "DLX",
        name: "Deluxe Room",
        description: "Spacious deluxe room with king bed and balcony",
        capacity: 3,
      },
      {
        propertyCode: "HSE002",
        code: "SUI",
        name: "Suite",
        description: "Luxury suite with separate living area",
        capacity: 4,
      },
      {
        propertyCode: "HSE003",
        code: "ECO",
        name: "Economy Room",
        description: "Compact budget-friendly room",
        capacity: 2,
      },
    ];

    await RoomType.insertMany(demo);

    console.log("✅ RoomTypes seeded:");
    demo.forEach(rt => console.log(` - ${rt.propertyCode} :: ${rt.code} :: ${rt.name}`));

    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
