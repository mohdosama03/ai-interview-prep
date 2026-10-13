import Feedback from "../models/Feedback.js";
import Interview from "../models/Interview.js";
import { evaluateAnswer } from "../services/aiService.js";

// @route GET /api/feedback/:interviewId
export const getFeedbackForInterview = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({
      interviewId: req.params.interviewId,
      userId: req.user._id,
    }).sort({ createdAt: 1 });

    res.json({ success: true, count: feedbacks.length, feedbacks });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/feedback
// Mostly created internally via interviewController.submitAnswer,
// but exposed here in case a client needs to create one directly.
export const createFeedback = async (req, res, next) => {
  try {
    const { interviewId, question, answerText, followUps = [] } = req.body || {};
    if (!interviewId || typeof question !== "string" || !question.trim() || question.length > 500 || typeof answerText !== "string" || !answerText.trim() || answerText.length > 5000) {
      return res.status(400).json({ success: false, message: "A valid interview, question, and answer are required." });
    }
    if (!Array.isArray(followUps) || followUps.length > 2 || followUps.some((item) =>
      !item || typeof item.question !== "string" || !item.question.trim() || item.question.length > 500 || typeof item.answerText !== "string" || !item.answerText.trim() || item.answerText.length > 5000
    )) {
      return res.status(400).json({ success: false, message: "Follow-up answers are invalid." });
    }
    const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    if (!interview.questions.includes(question)) {
      return res.status(400).json({ success: false, message: "Question does not belong to this interview." });
    }

    const result = await evaluateAnswer(question, answerText, followUps);
    const feedback = await Feedback.create({
      userId: req.user._id,
      interviewId: interview._id,
      question,
      ...result,
    });
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    next(err);
  }
};
