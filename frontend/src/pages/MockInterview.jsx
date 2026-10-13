import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Clock, SkipForward, Send, CheckCircle2, ArrowRight, Home, RotateCw, MessageCircleQuestion } from "lucide-react";
import { interviewAPI } from "../services/api.js";
import Loader from "../components/Loader.jsx";
import { useToast } from "../components/Toast.jsx";

function ScoreBar({ label, value }) {
  const scored = Number.isFinite(value);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-semibold">{scored ? `${value}/10` : "Not scored"}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-500 to-brandblue-500"
          style={{ width: `${scored ? (value / 10) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

const SCORE_CATEGORIES = [
  { key: "communication", label: "Communication & Delivery", score: "communicationScore" },
  { key: "technical", label: "Technical Knowledge", score: "technicalScore" },
  { key: "relevance", label: "Relevance to the Question", score: "relevanceScore" },
  { key: "evidence", label: "Supporting Evidence and Examples", score: "evidenceScore" },
];

function FeedbackPanel({ feedback, onRetry, retrying = false }) {
  if (!feedback) return null;
  const assessmentUnavailable = feedback.assessmentStatus === "unavailable" && !Number.isFinite(feedback.overallScore);
  const assessmentComplete = feedback.assessmentStatus === "complete" || Number.isFinite(feedback.overallScore);
  return (
    <div className="mt-6 space-y-4" aria-live="polite">
      {assessmentUnavailable && (
        <div className="card flex flex-col gap-3 border-amber-300/70 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-amber-400/20">
          <div>
            <h3 className="font-semibold text-amber-700 dark:text-amber-300">Evaluation unavailable</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{feedback.assessmentMessage}</p>
          </div>
          {feedback.retryable && onRetry && (
            <button onClick={onRetry} disabled={retrying} className="btn-secondary shrink-0 text-sm">
              <RotateCw size={15} className={retrying ? "animate-spin" : ""} />
              {retrying ? "Retrying..." : "Retry evaluation"}
            </button>
          )}
        </div>
      )}

      <div className="card space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold">Answer feedback</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Text responses measure written clarity and structure, not spoken fluency.</p>
          </div>
          <div className="rounded-xl bg-accent-500/10 px-4 py-2 text-center">
            <div className="text-[11px] font-medium uppercase tracking-wide text-accent-600 dark:text-accent-300">Overall</div>
            <div className="font-display text-xl font-bold">{Number.isFinite(feedback.overallScore) ? `${feedback.overallScore}/10` : "—"}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SCORE_CATEGORIES.map((category) => (
            <section key={category.key} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <ScoreBar label={category.label} value={feedback[category.score]} />
              {feedback.scoreExplanations?.[category.key] && (
                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{feedback.scoreExplanations[category.key]}</p>
              )}
            </section>
          ))}
        </div>
        {feedback.strengths?.length > 0 && (
          <div className="rounded-xl bg-emerald-500/5 p-4">
            <h4 className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Strengths</h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {feedback.strengths.map((strength, index) => <li key={index}>• {strength}</li>)}
            </ul>
          </div>
        )}
      </div>

      {(!feedback.feedbackPoints || feedback.feedbackPoints.length === 0) &&
        ((feedback.weaknesses?.length || 0) > 0 || (feedback.improvement?.length || 0) > 0 || feedback.betterAnswer) && (
          <section className="card space-y-4 p-5 sm:p-6">
            <h4 className="font-display font-semibold">Earlier evaluation notes</h4>
            {feedback.weaknesses?.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium">Areas to improve</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {feedback.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            )}
            {feedback.improvement?.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium">Suggestions</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {feedback.improvement.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            )}
            {feedback.betterAnswer && (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                <strong>General answer framework:</strong> {feedback.betterAnswer}
              </p>
            )}
          </section>
        )}

      {SCORE_CATEGORIES.map((category) => {
        const points = feedback.feedbackPoints?.filter((point) => point.category === category.key) || [];
        return (
          <section key={category.key} className="card p-5 sm:p-6">
            <h4 className="font-display font-semibold">{category.label}</h4>
            {points.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {assessmentComplete ? "No specific improvement point was identified for this category." : "Detailed feedback will appear after a successful evaluation."}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {points.map((point, index) => (
                  <article key={`${point.category}-${index}`} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                    <blockquote className="border-l-4 border-accent-400 bg-accent-500/5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      “{point.quote}”
                      <span className="mt-1 block text-[11px] font-normal text-slate-500">From {point.source === "follow_up" ? "your follow-up response" : "your original answer"}</span>
                    </blockquote>
                    <details className="group mt-3 text-sm">
                      <summary className="cursor-pointer font-medium text-accent-600 marker:text-accent-500 dark:text-accent-300">View explanation and suggestion</summary>
                      <div className="mt-3 space-y-3 text-slate-600 dark:text-slate-300">
                        <p><strong>What to improve:</strong> {point.issue}</p>
                        <p><strong>Why it matters:</strong> {point.whyItMatters}</p>
                        <p><strong>Try this:</strong> {point.suggestion}</p>
                        {point.improvedExample && (
                          <p className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                            <strong>{point.hypothetical ? "Hypothetical template:" : "Possible rephrasing:"}</strong> {point.improvedExample}
                          </p>
                        )}
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {feedback.recommendation && assessmentComplete && (
        <div className="card p-5 sm:p-6">
          <h4 className="mb-2 text-sm font-semibold text-brandblue-500">Next step</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">{feedback.recommendation}</p>
        </div>
      )}
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
  const [pendingAnswer, setPendingAnswer] = useState("");
  const [followUpQuestion, setFollowUpQuestion] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [retryingIndex, setRetryingIndex] = useState(null);

  const currentIndex = interview?.answers?.length || 0;
  const totalQuestions = interview?.questions?.length || 0;
  const currentQuestion = interview?.questions?.[currentIndex];
  const displayedQuestion = currentFeedback ? interview?.answers?.[currentIndex - 1]?.question : currentQuestion;
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

  const persistAnswer = async ({ answer, skipped = false, exchanges = [], followUpsSkipped = false }) => {
    const res = await interviewAPI.submitAnswer(id, {
      question: currentQuestion,
      answerText: skipped ? "" : answer,
      skipped,
      followUps: exchanges,
      followUpsSkipped,
    });
    setInterview(res.data.interview);
    setCurrentFeedback(res.data.feedback);
    setFeedbacks((existing) => res.data.feedback ? [...existing, res.data.feedback] : existing);
    setAnswerText("");
    setPendingAnswer("");
    setFollowUpQuestion(null);
    setFollowUps([]);
    setElapsed(0);
  };

  const handleSubmitAnswer = async (skipped = false) => {
    if (!currentQuestion) return;
    setSubmitting(true);
    try {
      if (skipped) {
        await persistAnswer({ answer: "", skipped: true });
        return;
      }

      if (followUpQuestion) {
        if (!answerText.trim()) return;
        const exchanges = [...followUps, { question: followUpQuestion, answerText: answerText.trim() }];
        if (exchanges.length < 2) {
          const next = await interviewAPI.getFollowUp(id, {
            question: currentQuestion,
            answerText: pendingAnswer,
            followUps: exchanges,
          });
          if (next.data.followUpQuestion) {
            setFollowUps(exchanges);
            setFollowUpQuestion(next.data.followUpQuestion);
            setAnswerText("");
            return;
          }
        }
        await persistAnswer({ answer: pendingAnswer, exchanges });
        return;
      }

      if (!answerText.trim()) return;
      const originalAnswer = answerText.trim();
      const next = await interviewAPI.getFollowUp(id, {
        question: currentQuestion,
        answerText: originalAnswer,
        followUps: [],
      });
      if (next.data.followUpQuestion) {
        setPendingAnswer(originalAnswer);
        setFollowUpQuestion(next.data.followUpQuestion);
        setAnswerText("");
        return;
      }
      await persistAnswer({ answer: originalAnswer });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipFollowUp = async () => {
    setSubmitting(true);
    try {
      await persistAnswer({ answer: pendingAnswer, exchanges: followUps, followUpsSkipped: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = async (answerIndex) => {
    setRetryingIndex(answerIndex);
    try {
      const res = await interviewAPI.retryEvaluation(id, answerIndex);
      setInterview(res.data.interview);
      setFeedbacks((existing) => existing.map((feedback) => feedback._id === res.data.feedback._id ? res.data.feedback : feedback));
      if (answerIndex === currentIndex - 1) setCurrentFeedback(res.data.feedback);
      toast.success(res.data.feedback.assessmentStatus === "complete" ? "Evaluation updated." : "AI evaluation is still unavailable.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not retry evaluation");
    } finally {
      setRetryingIndex(null);
    }
  };

  const handleNext = () => {
    setCurrentFeedback(null);
    setAnswerText("");
    setPendingAnswer("");
    setFollowUpQuestion(null);
    setFollowUps([]);
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
              {new Date(interview.createdAt).toLocaleString()} • Score: {Number.isFinite(interview.score) ? `${interview.score}/10` : "Not scored"}
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
                {a.followUps?.map((exchange, followUpIndex) => (
                  <div key={followUpIndex} className="mb-3 rounded-lg border border-accent-500/20 p-3 text-sm">
                    <p className="font-medium text-accent-600 dark:text-accent-300">Follow-up: {exchange.question}</p>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{exchange.answerText}</p>
                  </div>
                ))}
                {a.followUpsSkipped && <p className="mb-3 text-xs italic text-slate-500">A follow-up was skipped.</p>}
                {fb && <FeedbackPanel feedback={fb} onRetry={fb.retryable ? () => handleRetry(idx) : undefined} retrying={retryingIndex === idx} />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Interview completed ---
  if (isDone && !currentFeedback) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="card p-10">
          <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={48} />
          <h1 className="font-display text-2xl font-bold">
            {interview.completed ? "Interview Completed!" : "All questions answered"}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {interview.completed
              ? Number.isFinite(interview.score)
                ? `Your overall score: ${interview.score}/10`
                : "No verified score is available yet. Review each answer to retry its evaluation."
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
              {Math.min(currentFeedback ? currentIndex : currentIndex + 1, totalQuestions)} / {totalQuestions}
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
              {followUpQuestion ? "Follow-up question" : "Interviewer Question"}
            </div>
            {followUpQuestion ? (
              <>
                <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-white/5">
                  <p className="font-semibold">Your original answer</p>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">{pendingAnswer}</p>
                  {followUps.map((exchange, index) => (
                    <div key={index} className="mt-3 border-t border-slate-200 pt-3 dark:border-white/10">
                      <p className="font-medium text-accent-600 dark:text-accent-300">{exchange.question}</p>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{exchange.answerText}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-6 rounded-xl border border-accent-500/20 bg-accent-500/5 p-4">
                  <p className="flex gap-2 text-lg font-medium leading-relaxed"><MessageCircleQuestion className="mt-1 shrink-0 text-accent-500" size={19} />{followUpQuestion}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Follow-up {followUps.length + 1} of 2. Add detail if you can, or skip this follow-up.</p>
                </div>
              </>
            ) : (
            <p className="mb-6 text-lg font-medium leading-relaxed">{currentFeedback ? displayedQuestion : currentQuestion}</p>
            )}

            {!currentFeedback ? (
              <>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={7}
                  placeholder={followUpQuestion ? "Add details for this follow-up..." : "Type your answer here..."}
                  className="input-field resize-none"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSubmitAnswer(false)}
                    disabled={submitting || !answerText.trim()}
                    className="btn-primary"
                  >
                    <Send size={16} /> {submitting ? (followUpQuestion ? "Checking details..." : "Checking answer...") : followUpQuestion ? "Send follow-up" : "Submit Answer"}
                  </button>
                  {followUpQuestion ? (
                    <button onClick={handleSkipFollowUp} disabled={submitting} className="btn-secondary">
                      <SkipForward size={16} /> Skip follow-up & evaluate
                    </button>
                  ) : (
                    <button onClick={() => handleSubmitAnswer(true)} disabled={submitting} className="btn-secondary">
                      <SkipForward size={16} /> Skip question
                    </button>
                  )}
                </div>
              </>
            ) : (
              <button onClick={handleNext} className="btn-primary">
                {isDone ? "Continue to results" : "Next Question"} <ArrowRight size={16} />
              </button>
            )}
          </div>

          <FeedbackPanel feedback={currentFeedback} onRetry={currentFeedback?.retryable ? () => handleRetry(currentIndex - 1) : undefined} retrying={retryingIndex === currentIndex - 1} />
        </div>
      </div>
    </div>
  );
}
