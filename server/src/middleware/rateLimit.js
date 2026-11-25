import rateLimit from "express-rate-limit";

const json = (message) => ({ message });

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("Too many requests. Please slow down."),
});

// Stricter limit for credential endpoints (login, register, password reset).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("Too many attempts. Please try again in a few minutes."),
});
