import Interview from "../models/Interview.js";
import Feedback from "../models/Feedback.js";
import User from "../models/User.js";
import { generateQuestions, evaluateAnswer } from "../services/aiService.js";

const JOB_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "MERN Stack Developer",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "Software Engineer",
];
const INTERVIEW_TYPES = ["Technical", "HR", "Behavioral", "Coding"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

// @route POST /api/interviews
// Creates a new interview session with AI-generated questions
export const createInterview = async (req, res, next) => {
  try {
    const { jobRole, experienceLevel, interviewType, difficulty, questionCount } = req.body;

    if (!jobRole || !interviewType || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Choose a job role, interview type, and difficulty before starting.",
      });
    }
    if (!JOB_ROLES.includes(jobRole)) {
      return res.status(400).json({ success: false, message: "Choose a supported job role." });
    }
    if (!INTERVIEW_TYPES.includes(interviewType)) {
      return res.status(400).json({ success: false, message: "Choose a supported interview type." });
    }
    if (!DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ success: false, message: "Choose Easy, Medium, or Hard difficulty." });
    }

    const parsedCount = Number(questionCount) || 5;
    const count = Math.max(1, Math.min(10, Math.floor(parsedCount)));

    const questions = generateQuestions({
      jobRole,
      interviewType,
      difficulty,
      count,
    });

    if (!questions.length) {
      return res.status(400).json({ success: false, message: "No questions are available for this selection." });
    }

    const interview = await Interview.create({
      userId: req.user._id,
      jobRole,
      experienceLevel: experienceLevel || req.user.experienceLevel,
      interviewType,
      difficulty,
      questions,
      answers: [],
      completed: false,
    });

    res.status(201).json({ success: true, interview });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/interviews
export const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: interviews.length, interviews });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/interviews/:id
export const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });

    const feedbacks = await Feedback.find({ interviewId: interview._id });
    res.json({ success: true, interview, feedbacks });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/interviews/:id/answer
// Body: { question, answerText, skipped }
export const submitAnswer = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    if (interview.completed) {
      return res.status(400).json({ success: false, message: "This interview is already completed" });
    }

    const { question, answerText, skipped } = req.body;
    if (!question) return res.status(400).json({ success: false, message: "question is required" });

    let feedbackDoc = null;

    if (!skipped) {
      const evalResult = await evaluateAnswer(question, answerText);

      feedbackDoc = await Feedback.create({
        userId: req.user._id,
        interviewId: interview._id,
        question,
        technicalScore: evalResult.technicalScore,
        communicationScore: evalResult.communicationScore,
        confidenceScore: evalResult.confidenceScore,
        relevanceScore: evalResult.relevanceScore,
        overallScore: evalResult.overallScore,
        strengths: evalResult.strengths,
        weaknesses: evalResult.weaknesses,
        improvement: evalResult.improvement,
        betterAnswer: evalResult.betterAnswer,
        recommendation: evalResult.recommendation,
      });

      interview.answers.push({
        question,
        answerText,
        skipped: false,
        score: evalResult.overallScore,
        feedback: feedbackDoc._id,
      });
    } else {
      interview.answers.push({ question, answerText: "", skipped: true, score: 0 });
    }

    await interview.save();

    res.json({ success: true, interview, feedback: feedbackDoc });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/interviews/:id/complete
export const completeInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });

    const answered = interview.answers.filter((a) => !a.skipped);
    const overall = answered.length
      ? Math.round((answered.reduce((sum, a) => sum + (a.score || 0), 0) / answered.length) * 10) / 10
      : 0;

    interview.score = overall;
    interview.completed = true;
    await interview.save();

    // update streak
    const user = await User.findById(req.user._id);
    const today = new Date();
    const last = user.lastPracticeDate ? new Date(user.lastPracticeDate) : null;
    const isSameDay = last && last.toDateString() === today.toDateString();
    const isYesterday =
      last && new Date(today.setDate(today.getDate() - 1)).toDateString() === last.toDateString();

    if (!isSameDay) {
      user.streak = isYesterday ? user.streak + 1 : 1;
      user.lastPracticeDate = new Date();
      await user.save();
    }

    res.json({ success: true, interview });
  } catch (err) {
    next(err);
  }
};
