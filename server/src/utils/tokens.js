import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const REFRESH_COOKIE = "cc_refresh";

export const randomToken = () => crypto.randomBytes(32).toString("hex");
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, env.jwtAccessSecret, { expiresIn: env.accessTtl });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user.id, jti: crypto.randomUUID() }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshTtlDays}d`,
  });

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd || env.cookieSameSite === "none",
  sameSite: env.cookieSameSite,
  path: "/api/auth", // the refresh cookie is only ever sent to auth routes
});

export const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE, token, { ...cookieOptions(), maxAge: env.refreshTtlDays * 24 * 60 * 60 * 1000 });

export const clearRefreshCookie = (res) => res.clearCookie(REFRESH_COOKIE, cookieOptions());
