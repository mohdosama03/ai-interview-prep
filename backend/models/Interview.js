import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    questionRef: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    answerText: { type: String, default: "" },
    followUps: [
      {
        question: { type: String, required: true, maxlength: 500 },
        answerText: { type: String, required: true, maxlength: 5000 },
      },
    ],
    followUpsSkipped: { type: Boolean, default: false },
    skipped: { type: Boolean, default: false },
    score: { type: Number, default: null },
    feedback: { type: mongoose.Schema.Types.ObjectId, ref: "Feedback" },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobRole: { type: String, required: true },
    experienceLevel: { type: String, default: "Fresher" },
    interviewType: { type: String, enum: ["Technical", "HR", "Behavioral", "Coding"], default: "Technical" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    questions: [{ type: String }],
    answers: [answerSchema],
    score: { type: Number, default: null }, // overall, computed on completion
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
