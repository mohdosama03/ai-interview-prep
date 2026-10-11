import Question from "../models/Question.js";

// @route GET /api/questions
// Supports query params: search, category, difficulty, jobRole, type, saved=true
export const getQuestions = async (req, res, next) => {
  try {
    const { search, category, difficulty, jobRole, type, saved, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (jobRole) query.jobRole = jobRole;
    if (type) query.type = type;
    if (saved === "true" && req.user) query.savedBy = req.user._id;

    const skip = (Number(page) - 1) * Number(limit);
    const [questions, total] = await Promise.all([
      Question.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Question.countDocuments(query),
    ]);

    res.json({ success: true, count: questions.length, total, page: Number(page), questions });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/questions/:id
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });
    res.json({ success: true, question });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/questions
export const createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, question });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/questions/:id/save  (toggle bookmark)
export const toggleSaveQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    const alreadySaved = question.savedBy.some((id) => id.equals(req.user._id));
    if (alreadySaved) {
      question.savedBy = question.savedBy.filter((id) => !id.equals(req.user._id));
    } else {
      question.savedBy.push(req.user._id);
    }
    await question.save();

    res.json({ success: true, saved: !alreadySaved, question });
  } catch (err) {
    next(err);
  }
};
