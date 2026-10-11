import Feedback from "../models/Feedback.js";

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
    const feedback = await Feedback.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    next(err);
  }
};
