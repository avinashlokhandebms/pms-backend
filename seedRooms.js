// backend/seedRooms.js
import "dotenv/config.js";
import mongoose from "mongoose";
import Room from "./models/room.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  await Room.deleteMany({ propertyCode: "HSE001" });

  await Room.create([
    { propertyCode: "HSE001", roomNo: "101", roomTypeCode: "DLX", floor: "1", status: "vacant", houseStatus: "clean" },
    { propertyCode: "HSE001", roomNo: "102", roomTypeCode: "DLX", floor: "1", status: "occupied", houseStatus: "clean" },
    { propertyCode: "HSE001", roomNo: "201", roomTypeCode: "STD", floor: "2", status: "ooo", houseStatus: "dirty" },
  ]);

  console.log("Rooms seeded for HSE001");
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
