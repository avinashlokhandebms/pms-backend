// import jwt from "jsonwebtoken";
// const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// export function requireAuth(req, res, next) {
//   const auth = req.headers.authorization || "";
//   const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
//   if (!token) return res.status(401).json({ message: "Missing token" });

//   try {
//     const payload = jwt.verify(token, JWT_SECRET);
//     req.user = payload;
//     next();
//   } catch {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// }


import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload: { sub, customerId, propertyCode, role, modules? }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
