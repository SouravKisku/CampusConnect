import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isAllowedUniversityEmail } from "../utils/domains.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/email.js";
import {
  REFRESH_COOKIE, clearRefreshCookie, hashToken, randomToken,
  setRefreshCookie, signAccessToken, signRefreshToken,
} from "../utils/tokens.js";
import { saveImage } from "../services/upload.service.js";

const DAY = 24 * 60 * 60 * 1000;
const MAX_SESSIONS = 5;

// Creates a new refresh token (stored hashed), sets it as an httpOnly cookie and returns an access token.
// `user` must have been loaded with .select("+refreshTokens").
async function issueSession(res, user) {
  const refreshToken = signRefreshToken(user);
  const now = Date.now();
  const active = (user.refreshTokens || []).filter((t) => t.expiresAt.getTime() > now);
  active.push({ hash: hashToken(refreshToken), expiresAt: new Date(now + env.refreshTtlDays * DAY) });
  user.refreshTokens = active.slice(-MAX_SESSIONS);
  await user.save({ validateBeforeSave: false });
  setRefreshCookie(res, refreshToken);
  return signAccessToken(user);
}

async function mailVerification(user) {
  const token = randomToken();
  user.emailVerifyTokenHash = hashToken(token);
  user.emailVerifyExpires = new Date(Date.now() + DAY);
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail(user, token);
}

export const register = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!isAllowedUniversityEmail(data.email)) {
    throw new ApiError(400, "Use your university email address to sign up.", {
      code: "EMAIL_DOMAIN_NOT_ALLOWED",
      errors: { email: "This email domain isn't approved for CampusConnect" },
    });
  }
  if (await User.exists({ email: data.email })) {
    throw new ApiError(409, "An account with this email already exists.", { errors: { email: "Already registered" } });
  }
  if (data.studentId && (await User.exists({ studentId: data.studentId }))) {
    throw new ApiError(409, "That student ID is already linked to an account.", { errors: { studentId: "Already in use" } });
  }

  const avatar = req.file ? await saveImage(req.file, "avatars") : undefined;
  const user = await User.create({ ...data, avatar });

  let emailSent = true;
  try {
    await mailVerification(user);
  } catch (err) {
    emailSent = false;
    console.error("Verification email failed:", err.message);
  }

  res.status(201).json({
    message: emailSent
      ? "Account created. Check your university inbox to verify your email."
      : "Account created, but we couldn't send the verification email. Use “Resend” on the login page.",
    emailSent,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    emailVerifyTokenHash: hashToken(req.body.token),
    emailVerifyExpires: { $gt: new Date() },
  }).select("+emailVerifyTokenHash +emailVerifyExpires");
  if (!user) throw new ApiError(400, "This verification link is invalid or has expired.", { code: "TOKEN_INVALID" });

  user.isEmailVerified = true;
  user.emailVerifyTokenHash = undefined;
  user.emailVerifyExpires = undefined;
  await user.save({ validateBeforeSave: false });
  res.json({ message: "Email verified. You can log in now." });
});

// Always answers the same way so the endpoint can't be used to discover which emails are registered.
export const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && !user.isEmailVerified && user.isActive) {
    try { await mailVerification(user); } catch (err) { console.error("Verification email failed:", err.message); }
  }
  res.json({ message: "If that account needs verification, we've sent a new link." });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +refreshTokens");
  const valid = user ? await user.comparePassword(password) : false;
  if (!user || !valid) throw new ApiError(401, "Incorrect email or password.");
  if (!user.isActive) throw new ApiError(403, "This account has been deactivated. Contact your university admin.");
  if (!user.isEmailVerified) {
    throw new ApiError(403, "Verify your email before logging in.", { code: "EMAIL_NOT_VERIFIED" });
  }
  const accessToken = await issueSession(res, user);
  res.json({ accessToken, user });
});

// Refresh-token rotation: each refresh token works once and is swapped for a new one.
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, "No active session.");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtRefreshSecret);
  } catch {
    clearRefreshCookie(res);
    throw new ApiError(401, "Your session has expired. Please log in again.");
  }

  const user = await User.findById(payload.sub).select("+refreshTokens");
  const hash = hashToken(token);
  const known = user?.refreshTokens?.some((t) => t.hash === hash && t.expiresAt > new Date());
  if (!user || !user.isActive || !known) {
    clearRefreshCookie(res);
    throw new ApiError(401, "Your session has expired. Please log in again.");
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t.hash !== hash);
  const accessToken = await issueSession(res, user);
  res.json({ accessToken, user });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await User.updateOne({ "refreshTokens.hash": hashToken(token) }, { $pull: { refreshTokens: { hash: hashToken(token) } } });
  }
  clearRefreshCookie(res);
  res.json({ message: "Logged out." });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && user.isActive) {
    const token = randomToken();
    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    try { await sendPasswordResetEmail(user, token); } catch (err) { console.error("Reset email failed:", err.message); }
  }
  res.json({ message: "If an account exists for that email, a reset link is on its way." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(req.body.token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpires +refreshTokens");
  if (!user) throw new ApiError(400, "This reset link is invalid or has expired.", { code: "TOKEN_INVALID" });

  user.password = req.body.password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // sign out everywhere
  await user.save({ validateBeforeSave: false });
  res.json({ message: "Password updated. Log in with your new password." });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password +refreshTokens");
  if (!(await user.comparePassword(req.body.currentPassword))) {
    // 400 (not 401) so the client doesn't mistake this for an expired session
    throw new ApiError(400, "Your current password is incorrect.", { errors: { currentPassword: "Incorrect password" } });
  }
  user.password = req.body.newPassword;
  user.refreshTokens = []; // sign out other devices
  const accessToken = await issueSession(res, user);
  res.json({ accessToken, message: "Password changed." });
});

export const me = (req, res) => res.json({ user: req.user });
