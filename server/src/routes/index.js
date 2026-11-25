import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import { getMeta } from "../controllers/user.controller.js";

const router = Router();
router.get("/health", (_req, res) => res.json({ status: "ok" }));
router.get("/meta", getMeta); // departments + semesters for forms (public: needed on sign-up)
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
