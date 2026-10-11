import User from "../models/User.js";
import Interview from "../models/Interview.js";
import Feedback from "../models/Feedback.js";

// @route GET /api/users/profile
export const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "role", "experienceLevel", "skills", "profileImage", "resumeUrl"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      }
      req.user.password = req.body.password;
    }

    Object.assign(req.user, updates);
    await req.user.save();

    res.json({ success: true, user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const interviews = await Interview.find({ userId });
    const completed = interviews.filter((i) => i.completed);
    const questionsPracticed = interviews.reduce((sum, i) => sum + (i.answers?.length || 0), 0);

    const avgScore =
      completed.length > 0
        ? Math.round((completed.reduce((sum, i) => sum + (i.score || 0), 0) / completed.length) * 10) / 10
        : 0;

    const feedbacks = await Feedback.find({ userId });

    const categoryTotals = { Technical: [], HR: [], Coding: [], Communication: [] };
    completed.forEach((i) => {
      if (i.interviewType === "Technical") categoryTotals.Technical.push(i.score || 0);
      if (i.interviewType === "HR") categoryTotals.HR.push(i.score || 0);
      if (i.interviewType === "Coding") categoryTotals.Coding.push(i.score || 0);
    });
    feedbacks.forEach((f) => categoryTotals.Communication.push(f.communicationScore || 0));

    const avg = (arr) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) : 0);

    const progressChart = {
      Technical: avg(categoryTotals.Technical),
      HR: avg(categoryTotals.HR),
      Coding: avg(categoryTotals.Coding),
      Communication: avg(categoryTotals.Communication),
    };

    const recentInterviews = [...completed]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((i) => ({
        id: i._id,
        jobRole: i.jobRole,
        interviewType: i.interviewType,
        score: i.score,
        date: i.createdAt,
      }));

    res.json({
      success: true,
      stats: {
        interviewsCompleted: completed.length,
        questionsPracticed,
        averageScore: avgScore,
        currentStreak: req.user.streak || 0,
      },
      progressChart,
      recentInterviews,
    });
  } catch (err) {
    next(err);
  }
};
