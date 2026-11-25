import { Router } from "express";
import * as users from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { imageUpload } from "../services/upload.service.js";
import { updateProfileSchema } from "../validators/user.validators.js";

const router = Router();
router.use(protect);

// Fixed paths must be declared before "/:id"
router.get("/suggestions", users.getSuggestions);
router.patch("/me", validate(updateProfileSchema), users.updateMe);
router.post("/me/avatar", imageUpload.single("image"), users.uploadAvatar);
router.post("/me/cover", imageUpload.single("image"), users.uploadCover);
router.get("/:id", users.getProfile);

export default router;
