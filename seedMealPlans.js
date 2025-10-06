import "dotenv/config.js";
import mongoose from "mongoose";
import MealPlan from "./models/mealplan.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  await MealPlan.deleteMany({}); // dev only

  await MealPlan.create([
    {
      propertyCode: "HSE001",
      code: "EP",
      name: "European Plan",
      type: "EP",
      details: "Room only, no meals included.",
      taxType: "exclusive",
      isActive: true,
    },
    {
      propertyCode: "HSE001",
      code: "CP",
      name: "Continental Plan",
      type: "CP",
      details: "Includes breakfast.",
      taxType: "inclusive",
      isActive: true,
    },
    {
      propertyCode: "HSE002",
      code: "MAP",
      name: "Modified American Plan",
      type: "MAP",
      details: "Breakfast + one major meal.",
      taxType: "none",
      isActive: true,
    },
    {
      propertyCode: "HSE003",
      code: "CUSTOM1",
      name: "Custom Wellness Plan",
      type: "CUSTOM",
      details: "Detox smoothies + light dinner",
      taxType: "exclusive",
      isActive: false,
    },
  ]);

  console.log("✅ MealPlan seed done");
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
