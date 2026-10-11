import express from "express";
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  toggleSaveQuestion,
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getQuestions);
router.get("/:id", getQuestionById);
router.post("/", protect, createQuestion);
router.post("/:id/save", protect, toggleSaveQuestion);

export default router;
