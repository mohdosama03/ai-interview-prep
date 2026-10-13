import mongoose from "mongoose";

const feedbackPointSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ["communication", "technical", "relevance", "evidence"], required: true },
    quote: { type: String, required: true, maxlength: 500 },
    source: { type: String, enum: ["original", "follow_up"], required: true },
    issue: { type: String, required: true, maxlength: 1200 },
    whyItMatters: { type: String, required: true, maxlength: 1200 },
    suggestion: { type: String, required: true, maxlength: 1200 },
    improvedExample: { type: String, default: "", maxlength: 1200 },
    hypothetical: { type: Boolean, default: false },
  },
  { _id: false }
);

const scoreExplanationsSchema = new mongoose.Schema(
  {
    communication: { type: String, default: "" },
    technical: { type: String, default: "" },
    relevance: { type: String, default: "" },
    evidence: { type: String, default: "" },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true },
    question: { type: String, required: true },
    assessmentStatus: { type: String, enum: ["complete", "unavailable"], default: "unavailable" },
    assessmentMessage: { type: String, default: "" },
    retryable: { type: Boolean, default: false },
    technicalScore: { type: Number, min: 0, max: 10, default: null },
    communicationScore: { type: Number, min: 0, max: 10, default: null },
    confidenceScore: { type: Number, min: 0, max: 10, default: null },
    relevanceScore: { type: Number, min: 0, max: 10, default: null },
    evidenceScore: { type: Number, min: 0, max: 10, default: null },
    overallScore: { type: Number, min: 0, max: 10, default: null },
    scoreExplanations: { type: scoreExplanationsSchema, default: () => ({}) },
    feedbackPoints: { type: [feedbackPointSchema], default: [] },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    improvement: [{ type: String }],
    betterAnswer: { type: String, default: "" },
    recommendation: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
