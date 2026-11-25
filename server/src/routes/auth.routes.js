import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { imageUpload } from "../services/upload.service.js";
import {
  changePasswordSchema, emailOnlySchema, loginSchema, registerSchema, resetPasswordSchema, tokenSchema,
} from "../validators/auth.validators.js";

const router = Router();

// Registration is multipart so the profile picture can be sent with the form.
router.post("/register", authLimiter, imageUpload.single("avatar"), validate(registerSchema), auth.register);
router.post("/verify-email", authLimiter, validate(tokenSchema), auth.verifyEmail);
router.post("/resend-verification", authLimiter, validate(emailOnlySchema), auth.resendVerification);
router.post("/login", authLimiter, validate(loginSchema), auth.login);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);
router.post("/forgot-password", authLimiter, validate(emailOnlySchema), auth.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), auth.resetPassword);

router.get("/me", protect, auth.me);
router.patch("/password", protect, authLimiter, validate(changePasswordSchema), auth.changePassword);

export default router;
