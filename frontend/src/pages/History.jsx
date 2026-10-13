import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Calendar } from "lucide-react";
import { interviewAPI } from "../services/api.js";
import Loader from "../components/Loader.jsx";
import { useToast } from "../components/Toast.jsx";

export default function History() {
  const toast = useToast();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewAPI
      .list()
      .then((res) => setInterviews(res.data.interviews.filter((i) => i.completed)))
      .catch(() => toast.error("Could not load interview history"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader full />;

  const performanceLabel = (score) => {
    if (!Number.isFinite(score)) return { label: "Not scored", color: "bg-slate-500/10 text-slate-600 dark:text-slate-400" };
    if (score >= 8) return { label: "Excellent", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
    if (score >= 6) return { label: "Good", color: "bg-accent-500/10 text-accent-600 dark:text-accent-400" };
    if (score >= 4) return { label: "Fair", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" };
    return { label: "Needs Work", color: "bg-red-500/10 text-red-600 dark:text-red-400" };
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Interview History</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Review every completed session and its feedback.</p>
      </div>

      {interviews.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          No completed interviews yet.{" "}
          <Link to="/interview" className="font-medium text-accent-500 hover:underline">
            Start one now
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {interviews.map((i) => {
            const perf = performanceLabel(i.score);
            return (
              <div key={i._id} className="card p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="font-display font-semibold">{i.jobRole}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {i.interviewType} • {i.difficulty}
                    </div>
                  </div>
                  <span className={`badge ${perf.color}`}>{perf.label}</span>
                </div>

                <div className="mb-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {new Date(i.createdAt).toLocaleDateString()}
                  </span>
                  <span>{i.questions?.length || 0} questions</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Score: {Number.isFinite(i.score) ? `${i.score}/10` : "Not scored"}</span>
                </div>

                <Link to={`/history/${i._id}`} className="btn-secondary w-full justify-center text-sm">
                  <Eye size={15} /> View Details
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
