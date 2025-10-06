// backend/routes/authRoutes.js
import { Router } from "express";
import { loginController, changePasswordController } from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/login", loginController);                         // <-- /api/auth/login
router.post("/change-password", requireAuth, changePasswordController);

export default router;

