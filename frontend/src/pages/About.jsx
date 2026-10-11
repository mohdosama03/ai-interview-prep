import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-brandblue-500 text-white">
        <Sparkles size={22} />
      </span>
      <h1 className="font-display text-3xl font-bold">About AI Interview Prep</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        AI Interview Prep is a practice platform for students and job seekers who want to feel more
        prepared for interviews. It brings technical, coding, HR, and behavioral practice into one
        place, with sessions tailored to a selected job role and experience level.
      </p>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        Choose a format and difficulty, then work through questions from the project’s question
        bank in a timed mock interview. After each response, review feedback and scores for
        relevance, technical content, communication, and confidence. Save useful questions and
        revisit completed interviews to see how your scores change over time.
      </p>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        Feedback works out of the box with a built-in evaluation system that considers answer
        length, relevance, and examples. The backend can also connect to an optional Gemini API for
        AI-based evaluation. Accounts, interview history, and progress are managed by a React,
        Express, Node.js, and MongoDB application.
      </p>
      <Link to="/register" className="btn-primary mt-8 inline-flex">
        Get Started
      </Link>
    </div>
  );
}
