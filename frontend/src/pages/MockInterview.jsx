import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Clock, SkipForward, Send, CheckCircle2, ArrowRight, Home } from "lucide-react";
import { interviewAPI } from "../services/api.js";
import Loader from "../components/Loader.jsx";
import { useToast } from "../components/Toast.jsx";

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-semibold">{value}/10</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-500 to-brandblue-500"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

function FeedbackPanel({ feedback }) {
  if (!feedback) return null;
  return (
    <div className="card mt-6 space-y-6 p-6">
      <div>
        <h3 className="mb-3 font-display text-lg font-semibold">AI Evaluation</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ScoreBar label="Overall Score" value={feedback.overallScore} />
          <ScoreBar label="Technical Accuracy" value={feedback.technicalScore} />
          <ScoreBar label="Communication" value={feedback.communicationScore} />
          <ScoreBar label="Confidence" value={feedback.confidenceScore} />
          <ScoreBar label="Relevance" value={feedback.relevanceScore} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">What You Did Well</h4>
          <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
            {feedback.strengths?.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-500">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-amber-600 dark:text-amber-400">What You Can Improve</h4>
          <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
            {feedback.improvement?.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-500">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-accent-500">Better Answer</h4>
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
          {feedback.betterAnswer}
        </p>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-brandblue-500">AI Recommendation</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">{feedback.recommendation}</p>
      </div>
    </div>
  );
}

export default function MockInterview({ reviewMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [interview, setInterview] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const currentIndex = interview?.answers?.length || 0;
  const totalQuestions = interview?.questions?.length || 0;
  const currentQuestion = interview?.questions?.[currentIndex];
  const isDone = interview ? currentIndex >= totalQuestions : false;

  const loadInterview = async () => {
    setLoading(true);
    try {
      const res = await interviewAPI.getById(id);
      setInterview(res.data.interview);
      setFeedbacks(res.data.feedbacks || []);
    } catch (err) {
      toast.error("Could not load interview");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (reviewMode || isDone) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [reviewMode, isDone, currentIndex]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleSubmitAnswer = async (skipped = false) => {
    if (!currentQuestion) return;
    setSubmitting(true);
    try {
      const res = await interviewAPI.submitAnswer(id, {
        question: currentQuestion,
        answerText: skipped ? "" : answerText,
        skipped,
      });
      setInterview(res.data.interview);
      setCurrentFeedback(res.data.feedback);
      setAnswerText("");
      setElapsed(0);
    } catch (err) {
      toast.error("Could not submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setCurrentFeedback(null);
  };

  const handleFinish = async () => {
    try {
      const res = await interviewAPI.complete(id);
      setInterview(res.data.interview);
      toast.success("Interview completed!");
    } catch (err) {
      toast.error("Could not finalize interview");
    }
  };

  if (loading) return <Loader full />;
  if (!interview) return null;

  // --- Review mode (viewing a past completed interview from history) ---
  if (reviewMode) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">{interview.jobRole} — {interview.interviewType}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {new Date(interview.createdAt).toLocaleString()} • Score: {interview.score ?? "N/A"}/10
            </p>
          </div>
          <Link to="/history" className="btn-secondary text-sm">
            Back to History
          </Link>
        </div>

        <div className="space-y-8">
          {interview.answers.map((a, idx) => {
            const fb = feedbacks.find((f) => f.question === a.question);
            return (
              <div key={idx} className="card p-6">
                <div className="mb-1 text-xs font-medium text-accent-500">Question {idx + 1}</div>
                <p className="mb-4 font-medium">{a.question}</p>
                {a.skipped ? (
                  <p className="text-sm italic text-slate-400">Skipped</p>
                ) : (
                  <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                    {a.answerText}
                  </p>
                )}
                {fb && <FeedbackPanel feedback={fb} />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Interview completed ---
  if (isDone) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="card p-10">
          <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={48} />
          <h1 className="font-display text-2xl font-bold">
            {interview.completed ? "Interview Completed!" : "All questions answered"}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {interview.completed
              ? `Your overall score: ${interview.score}/10`
              : "Finish up to save this interview to your history."}
          </p>

          {!interview.completed ? (
            <button onClick={handleFinish} className="btn-primary mt-8">
              Finish & Get Results <ArrowRight size={16} />
            </button>
          ) : (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/dashboard" className="btn-secondary">
                <Home size={16} /> Dashboard
              </Link>
              <Link to="/interview" className="btn-primary">
                Practice Again
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Active interview ---
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        {/* Left panel */}
        <aside className="card h-fit space-y-4 p-6">
          <div>
            <div className="text-xs text-slate-400">Job Role</div>
            <div className="font-medium">{interview.jobRole}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Interview Type</div>
            <div className="font-medium">{interview.interviewType}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Difficulty</div>
            <span className="badge bg-accent-500/10 text-accent-600 dark:text-accent-400">{interview.difficulty}</span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Question</div>
            <div className="font-medium">
              {Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions}
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-white/5 dark:text-slate-400">
            <Clock size={15} /> {formatTime(elapsed)}
          </div>
        </aside>

        {/* Main area */}
        <div>
          <div className="card p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-500">
              Interviewer Question
            </div>
            <p className="mb-6 text-lg font-medium leading-relaxed">{currentQuestion}</p>

            {!currentFeedback ? (
              <>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={7}
                  placeholder="Type your answer here..."
                  className="input-field resize-none"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSubmitAnswer(false)}
                    disabled={submitting || !answerText.trim()}
                    className="btn-primary"
                  >
                    <Send size={16} /> {submitting ? "Evaluating..." : "Submit Answer"}
                  </button>
                  <button onClick={() => handleSubmitAnswer(true)} disabled={submitting} className="btn-secondary">
                    <SkipForward size={16} /> Skip
                  </button>
                </div>
              </>
            ) : (
              <button onClick={handleNext} className="btn-primary">
                Next Question <ArrowRight size={16} />
              </button>
            )}
          </div>

          <FeedbackPanel feedback={currentFeedback} />
        </div>
      </div>
    </div>
  );
}
