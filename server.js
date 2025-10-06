// backend/server.js
import "dotenv/config.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import roomtypeRoutes from "./routes/roomtypeRoutes.js";
import mealplanRoutes from "./routes/mealplanRoutes.js"; 
import roomRoutes from "./routes/roomRoutes.js";
import salespersonRoutes from "./routes/salespersonRoutes.js";
import designationsRoute from "./routes/designationsRoutes.js";
import kdsRoutes from "./routes/kdsRoutes.js";
import ledgerRoutes from "./routes/ledgerRoutes.js";
import visitPurposeRoutes from "./routes/visitPurposesRoutes.js";
import pickDropFacilityRoutes from "./routes/pickDropFacilityRoutes.js";
import billingInstructionsRouter from "./routes/billingInstructionsRoutes.js";
import identityRoutes from "./routes/identitiesRoutes.js";
import versionsRouter from "./routes/versionsRoutes.js"
// import statesRouter from "./routes/stateRoutes.js";




const app = express();
app.use(cors({
  origin: ["https://pms-backend-sage.vercel.app/"], // add your dev URL(s)
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/roomtypes",roomtypeRoutes);
app.use('/api/mealplan',mealplanRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/salespersons", salespersonRoutes);
app.use("/api/designations", designationsRoute);
app.use("/api/kdssettings", kdsRoutes);
app.use("/api/ledgers", ledgerRoutes);
app.use("/api/visitpurposes", visitPurposeRoutes);

app.use("/api/pickdropfacilities", pickDropFacilityRoutes);
app.use("/api/billinginstructions", billingInstructionsRouter);
app.use("/api/identity-details", identityRoutes);
app.use("/api/versions", versionsRouter);
// app.use("/api/states", statesRouter);



const PORT = process.env.PORT || 4000 ;

mongoose
  .connect(process.env.MONGO_URI, { autoIndex: true })
  .then(() => {
    console.log("Mongo connected");
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo connect error:", err.message);
    process.exit(1);
  });
