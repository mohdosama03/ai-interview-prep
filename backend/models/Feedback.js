import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true },
    question: { type: String, required: true },
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    relevanceScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    improvement: [{ type: String }],
    betterAnswer: { type: String, default: "" },
    recommendation: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
