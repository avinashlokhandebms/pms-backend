// import { loginService, changePasswordService } from "../services/authService.js";

// export async function loginController(req, res) {
//   try {
//     const { customerId, password, propertyCode } = req.body;
//     const result = await loginService({ customerId, password, propertyCode });
//     res.json(result);
//   } catch (err) {
//     res.status(err.status || 401).json({ message: err.message || "Login failed" });
//   }
// }

// export async function changePasswordController(req, res) {
//   try {
//     const { currentPassword, newPassword } = req.body;
//     const result = await changePasswordService({
//       userId: req.user.sub,
//       currentPassword,
//       newPassword,
//     });
//     res.json(result);
//   } catch (err) {
//     res.status(err.status || 400).json({ message: err.message || "Unable to change password" });
//   }
// }

// backend/controllers/authController.js
import "dotenv/config.js";
import { loginService, changePasswordService } from "../services/authService.js";

// cookie name + flags
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "token";
const COOKIE_SECURE =
  process.env.JWT_COOKIE_SECURE?.toLowerCase?.() === "true" ||
  process.env.NODE_ENV === "production";

/**
 * POST /api/auth/login
 * Body: { customerId, password, propertyCode }
 * Response: { ok, token, user }
 * - Also sets an httpOnly cookie so the frontend can use `credentials: "include"`
 */
export async function loginController(req, res) {
  try {
    const { customerId, password, propertyCode } = req.body || {};
    if (!customerId || !password) {
      return res.status(400).json({ message: "customerId and password are required" });
    }

    // capture request context for audit
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip;
    const userAgent = req.headers["user-agent"];

    // your service should verify user, pick active property/membership,
    // issue JWT (embedding { sub, customerId, roles, propertyCode, name }), etc.
    const result = await loginService({
      customerId,
      password,
      propertyCode, // optional: narrow to a specific property
      ip,
      userAgent,
    });
    // result is expected like: { ok:true, token, user: { id, name, roles, propertyCode } }

    // set cookie (kept AND also returned in body for header-based clients)
    res.cookie(COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: COOKIE_SECURE,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/", // available to all routes
    });

    return res.json({
      ok: true,
      token: result.token, // keep this so SPA can store in localStorage if you prefer header auth
      user: result.user,
    });
  } catch (err) {
    const status = err.status || 401;
    return res.status(status).json({ message: err.message || "Login failed" });
  }
}

/**
 * POST /api/auth/change-password
 * Header: Authorization: Bearer <token>  (or cookie)
 * Body: { currentPassword, newPassword }
 */
export async function changePasswordController(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    const result = await changePasswordService({
      userId: req.user?.sub, // set by requireAuth
      currentPassword,
      newPassword,
    });

    return res.json({ ok: true, ...result });
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ message: err.message || "Unable to change password" });
  }
}

/**
 * POST /api/auth/logout
 * Clears the auth cookie for cookie-based sessions.
 */
export async function logoutController(_req, res) {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: COOKIE_SECURE,
      path: "/",
    });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: "Unable to logout" });
  }
}
