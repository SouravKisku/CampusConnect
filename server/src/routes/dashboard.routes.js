import { Router } from "express";
import * as dashboard from "../controllers/dashboard.controller.js";
import { authorize, protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", dashboard.getDashboard);
router.get("/admin", authorize("admin"), dashboard.getAdminDashboard);

export default router;
