import express from "express";
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  toggleSaveQuestion,
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getQuestions);
router.get("/:id", getQuestionById);
router.post("/", createQuestion);
router.post("/:id/save", toggleSaveQuestion);

export default router;
