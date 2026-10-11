import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: { type: String, required: true }, // e.g. JavaScript, React, Node.js, MongoDB, HR
    topic: { type: String, default: "" }, // e.g. Promises, Hooks, CRUD
    jobRole: { type: String, default: "Full Stack Developer" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    type: { type: String, enum: ["Technical", "HR", "Behavioral", "Coding"], default: "Technical" },
    correctAnswer: { type: String, default: "" },
    explanation: { type: String, default: "" },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

questionSchema.index({ question: "text", topic: "text", category: "text" });

export default mongoose.model("Question", questionSchema);
