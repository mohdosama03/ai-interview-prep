/**
 * Run with: npm run seed
 * Populates the MongoDB "questions" collection from the built-in question
 * bank in services/aiService.js so the Question Bank page has real data.
 */
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Question from "./models/Question.js";
import { getQuestionBank } from "./services/aiService.js";

dotenv.config();

const roleForCategory = {
  JavaScript: "Full Stack Developer",
  React: "Frontend Developer",
  "Node.js": "Backend Developer",
  MongoDB: "Backend Developer",
  HR: "Full Stack Developer",
  Behavioral: "Full Stack Developer",
  Coding: "Software Engineer",
};

const typeForCategory = {
  JavaScript: "Technical",
  React: "Technical",
  "Node.js": "Technical",
  MongoDB: "Technical",
  HR: "HR",
  Behavioral: "Behavioral",
  Coding: "Coding",
};

const difficulties = ["Easy", "Medium", "Hard"];

const run = async () => {
  await connectDB();
  const bank = getQuestionBank();

  const docs = [];
  Object.entries(bank).forEach(([category, questions]) => {
    questions.forEach((question, idx) => {
      docs.push({
        question,
        category,
        topic: category,
        jobRole: roleForCategory[category] || "Full Stack Developer",
        difficulty: difficulties[idx % difficulties.length],
        type: typeForCategory[category] || "Technical",
      });
    });
  });

  await Question.deleteMany({});
  await Question.insertMany(docs);

  console.log(`Seeded ${docs.length} questions.`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
