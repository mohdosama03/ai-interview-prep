import Interview from "../models/Interview.js";
import Feedback from "../models/Feedback.js";
import User from "../models/User.js";
import { generateQuestions, generateFollowUp, evaluateAnswer } from "../services/aiService.js";

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
const EXPERIENCE_LEVELS = ["Fresher", "Junior", "Intermediate", "Experienced"];

// @route POST /api/interviews
// Creates a new interview session with AI-generated questions
export const createInterview = async (req, res, next) => {
  try {
    const { jobRole, experienceLevel, interviewType, difficulty, questionCount } = req.body || {};

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
    if (experienceLevel !== undefined && !EXPERIENCE_LEVELS.includes(experienceLevel)) {
      return res.status(400).json({ success: false, message: "Choose a supported experience level." });
    }

    if (questionCount !== undefined && (!Number.isInteger(Number(questionCount)) || Number(questionCount) < 1 || Number(questionCount) > 10)) {
      return res.status(400).json({ success: false, message: "Question count must be a whole number from 1 to 10." });
    }
    const count = questionCount === undefined ? 5 : Number(questionCount);

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

    const feedbacks = await Feedback.find({ interviewId: interview._id, userId: req.user._id });
    res.json({ success: true, interview, feedbacks });
  } catch (err) {
    next(err);
  }
};

function validateAnswerPayload({ question, answerText, followUps }) {
  if (typeof question !== "string" || !question.trim() || question.length > 500) {
    return "A valid question is required.";
  }
  if (typeof answerText !== "string" || answerText.length > 5000) {
    return "Answer must be text no longer than 5,000 characters.";
  }
  if (followUps !== undefined && !Array.isArray(followUps)) return "Follow-up answers must be a list.";
  if ((followUps || []).length > 2) return "At most two follow-up answers are allowed.";
  for (const item of followUps || []) {
    if (!item || typeof item.question !== "string" || !item.question.trim() || item.question.length > 500) {
      return "Each follow-up must include a valid question.";
    }
    if (typeof item.answerText !== "string" || item.answerText.length > 5000) {
      return "Each follow-up answer must be text no longer than 5,000 characters.";
    }
    if (!item.answerText.trim()) return "Each follow-up answer must include a response.";
  }
  return null;
}

async function getActiveInterview(req, res) {
  const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
  if (!interview) {
    res.status(404).json({ success: false, message: "Interview not found" });
    return null;
  }
  if (interview.completed) {
    res.status(400).json({ success: false, message: "This interview is already completed" });
    return null;
  }
  return interview;
}

function validateCurrentQuestion(interview, question, res) {
  const expectedQuestion = interview.questions[interview.answers.length];
  if (!expectedQuestion || question !== expectedQuestion) {
    res.status(400).json({ success: false, message: "Submit the current unanswered interview question." });
    return false;
  }
  return true;
}

// @route POST /api/interviews/:id/follow-up
// Returns one targeted follow-up or null when the answer is ready to evaluate.
export const getAnswerFollowUp = async (req, res, next) => {
  try {
    const { question, answerText, followUps = [] } = req.body || {};
    const validationError = validateAnswerPayload({ question, answerText, followUps });
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    if (!answerText.trim()) return res.status(400).json({ success: false, message: "Write an answer before requesting a follow-up." });

    const interview = await getActiveInterview(req, res);
    if (!interview || !validateCurrentQuestion(interview, question, res)) return;

    const followUpQuestion = await generateFollowUp(question, answerText, followUps);
    res.json({ success: true, followUpQuestion: followUpQuestion || null });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/interviews/:id/answer
// Body: { question, answerText, skipped }
export const submitAnswer = async (req, res, next) => {
  try {
    const { question, answerText = "", skipped = false, followUps = [], followUpsSkipped = false } = req.body || {};
    const validationError = validateAnswerPayload({ question, answerText, followUps });
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    if (typeof skipped !== "boolean" || typeof followUpsSkipped !== "boolean") {
      return res.status(400).json({ success: false, message: "Skip flags must be boolean values." });
    }
    if (!skipped && !answerText.trim()) {
      return res.status(400).json({ success: false, message: "Write an answer or skip this question." });
    }

    const interview = await getActiveInterview(req, res);
    if (!interview || !validateCurrentQuestion(interview, question, res)) return;

    let feedbackDoc = null;

    if (!skipped) {
      const evalResult = await evaluateAnswer(question, answerText, followUps);

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
        assessmentStatus: evalResult.assessmentStatus,
        assessmentMessage: evalResult.assessmentMessage,
        retryable: evalResult.retryable,
        evidenceScore: evalResult.evidenceScore,
        scoreExplanations: evalResult.scoreExplanations,
        feedbackPoints: evalResult.feedbackPoints,
      });

      interview.answers.push({
        question,
        answerText,
        followUps,
        followUpsSkipped,
        skipped: false,
        score: evalResult.overallScore,
        feedback: feedbackDoc._id,
      });
    } else {
      interview.answers.push({ question, answerText: "", followUps: [], skipped: true, score: null });
    }

    await interview.save();

    res.json({ success: true, interview, feedback: feedbackDoc });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/interviews/:id/answers/:answerIndex/retry
export const retryAnswerEvaluation = async (req, res, next) => {
  try {
    const answerIndex = Number(req.params.answerIndex);
    if (!Number.isInteger(answerIndex) || answerIndex < 0) {
      return res.status(400).json({ success: false, message: "Answer index must be a non-negative integer." });
    }
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    const answer = interview.answers[answerIndex];
    if (!answer || answer.skipped || !answer.feedback) {
      return res.status(404).json({ success: false, message: "No submitted answer is available to retry." });
    }
    const feedbackDoc = await Feedback.findOne({ _id: answer.feedback, interviewId: interview._id, userId: req.user._id });
    if (!feedbackDoc) return res.status(404).json({ success: false, message: "Feedback not found" });

    const result = await evaluateAnswer(answer.question, answer.answerText, answer.followUps || []);
    Object.assign(feedbackDoc, {
      assessmentStatus: result.assessmentStatus,
      assessmentMessage: result.assessmentMessage,
      retryable: result.retryable,
      technicalScore: result.technicalScore,
      communicationScore: result.communicationScore,
      confidenceScore: result.confidenceScore,
      relevanceScore: result.relevanceScore,
      evidenceScore: result.evidenceScore,
      overallScore: result.overallScore,
      scoreExplanations: result.scoreExplanations,
      feedbackPoints: result.feedbackPoints,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      improvement: result.improvement,
      betterAnswer: result.betterAnswer,
      recommendation: result.recommendation,
    });
    answer.score = result.overallScore;
    if (interview.completed) {
      const scoredAnswers = interview.answers.filter((item) => !item.skipped && Number.isFinite(item.score));
      interview.score = scoredAnswers.length
        ? Math.round((scoredAnswers.reduce((sum, item) => sum + item.score, 0) / scoredAnswers.length) * 10) / 10
        : null;
    }
    await Promise.all([feedbackDoc.save(), interview.save()]);
    res.json({ success: true, feedback: feedbackDoc, interview });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/interviews/:id/complete
export const completeInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    if (!interview.completed && interview.answers.length < interview.questions.length) {
      return res.status(400).json({ success: false, message: "Answer or skip each question before finishing." });
    }

    const scoredAnswers = interview.answers.filter((answer) => !answer.skipped && Number.isFinite(answer.score));
    const overall = scoredAnswers.length
      ? Math.round((scoredAnswers.reduce((sum, answer) => sum + answer.score, 0) / scoredAnswers.length) * 10) / 10
      : null;

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
