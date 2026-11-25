import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Requires a valid access token and loads the current user from the database,
// so deactivated accounts and role changes take effect immediately.
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError(401, "Please log in to continue.");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtAccessSecret);
  } catch {
    throw new ApiError(401, "Your session has expired. Please log in again.", { code: "TOKEN_INVALID" });
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, "This account is no longer available.");
  req.user = user;
  next();
});

// Role-based access control: authorize("admin"), authorize("faculty", "admin")
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You don't have permission to do that."));
    }
    next();
  };
