import express from "express";
import { getFeedbackForInterview, createFeedback } from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/:interviewId", getFeedbackForInterview);
router.post("/", createFeedback);

export default router;
