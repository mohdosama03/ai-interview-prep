import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { Trophy, BookOpenCheck, Percent, Flame, ArrowRight, Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { userAPI } from "../services/api.js";
import Loader from "../components/Loader.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI
      .getDashboard()
      .then((res) => setData(res.data))
      .catch(() => toast.error("Could not load dashboard data"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader full />;

  const stats = data?.stats || { interviewsCompleted: 0, questionsPracticed: 0, averageScore: null, currentStreak: 0 };
  const chart = data?.progressChart || { Technical: null, HR: null, Coding: null, Communication: null };
  const recent = data?.recentInterviews || [];

  const radarData = Object.entries(chart).map(([category, value]) => ({ category, value }));

  const statCards = [
    { label: "Interviews Completed", value: stats.interviewsCompleted, icon: Trophy, color: "from-accent-500 to-accent-600" },
    { label: "Questions Practiced", value: stats.questionsPracticed, icon: BookOpenCheck, color: "from-brandblue-500 to-blue-600" },
    { label: "Average Score", value: Number.isFinite(stats.averageScore) ? `${stats.averageScore}/10` : "—", icon: Percent, color: "from-emerald-500 to-emerald-600" },
    { label: "Current Streak", value: `${stats.currentStreak} days`, icon: Flame, color: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Continue your interview preparation.</p>
        </div>
        <Link to="/interview" className="btn-primary">
          Start New Interview <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white`}>
              <s.icon size={18} />
            </div>
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Progress chart */}
        <div className="card p-6 lg:col-span-1">
          <h2 className="mb-4 font-display text-lg font-semibold">Preparation Progress</h2>
          {radarData.some((entry) => Number.isFinite(entry.value)) ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="currentColor" className="text-slate-200 dark:text-white/10" />
                <PolarAngleAxis dataKey="category" tick={{ fill: "currentColor", fontSize: 12 }} className="text-slate-500 dark:text-slate-400" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#7c5cff" fill="#7c5cff" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[260px] items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
              Verified AI scores will appear here after your answers are evaluated.
            </p>
          )}
        </div>

        {/* Recent interviews */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent Interviews</h2>
            <Link to="/history" className="text-sm font-medium text-accent-500 hover:underline">
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              <p>No interviews yet. Your completed sessions will show up here.</p>
              <Link to="/interview" className="btn-primary mt-4">
                Start your first interview
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((i) => (
                <div
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-white/5"
                >
                  <div>
                    <div className="font-medium">{i.jobRole}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {i.interviewType} • {new Date(i.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge bg-accent-500/10 text-accent-600 dark:text-accent-400">
                      Score {Number.isFinite(i.score) ? `${i.score}/10` : "Not scored"}
                    </span>
                    <Link to={`/history/${i.id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                      <Eye size={14} /> View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
