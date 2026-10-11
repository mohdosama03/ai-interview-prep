import express from "express";
import { getProfile, updateProfile, getDashboardStats } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/dashboard", getDashboardStats);

export default router;
