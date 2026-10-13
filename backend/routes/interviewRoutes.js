import express from "express";
import {
  createInterview,
  getInterviews,
  getInterviewById,
  getAnswerFollowUp,
  submitAnswer,
  retryAnswerEvaluation,
  completeInterview,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", createInterview);
router.get("/", getInterviews);
router.get("/:id", getInterviewById);
router.post("/:id/follow-up", getAnswerFollowUp);
router.post("/:id/answer", submitAnswer);
router.post("/:id/answers/:answerIndex/retry", retryAnswerEvaluation);
router.post("/:id/complete", completeInterview);

export default router;
