import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Lightbulb } from "lucide-react";
import { interviewAPI } from "../services/api.js";
import Loader from "../components/Loader.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Progress() {
  const toast = useToast();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewAPI
      .list()
      .then((res) => setInterviews(res.data.interviews.filter((i) => i.completed).reverse()))
      .catch(() => toast.error("Could not load progress data"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader full />;

  const scoreOverTime = interviews.map((i, idx) => ({
    name: `#${idx + 1}`,
    score: i.score || 0,
    date: new Date(i.createdAt).toLocaleDateString(),
  }));

  const topicTotals = {};
  interviews.forEach((i) => {
    if (!topicTotals[i.jobRole]) topicTotals[i.jobRole] = [];
    topicTotals[i.jobRole].push(i.score || 0);
  });
  const topicAverages = Object.entries(topicTotals)
    .map(([role, scores]) => ({
      role,
      avg: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
    }))
    .sort((a, b) => b.avg - a.avg);

  const strongest = topicAverages[0];
  const weakest = topicAverages[topicAverages.length - 1];

  const overall = {
    Technical: avgFor(interviews, "Technical"),
    HR: avgFor(interviews, "HR"),
    Coding: avgFor(interviews, "Coding"),
    Behavioral: avgFor(interviews, "Behavioral"),
  };

  function avgFor(list, type) {
    const filtered = list.filter((i) => i.interviewType === type);
    if (!filtered.length) return 0;
    return Math.round((filtered.reduce((sum, i) => sum + (i.score || 0), 0) / filtered.length) * 10);
  }

  const insights = [];
  if (interviews.length >= 2) {
    const recentAvg =
      interviews.slice(-3).reduce((s, i) => s + (i.score || 0), 0) / Math.min(3, interviews.length);
    const earlyAvg = interviews.slice(0, 3).reduce((s, i) => s + (i.score || 0), 0) / Math.min(3, interviews.length);
    const delta = Math.round(((recentAvg - earlyAvg) / (earlyAvg || 1)) * 100);
    if (delta !== 0) {
      insights.push(
        `Your average score has ${delta > 0 ? "improved" : "declined"} by ${Math.abs(delta)}% comparing your most recent sessions to your earliest ones.`
      );
    }
  }
  if (weakest) insights.push(`Your weakest area is ${weakest.role} at an average of ${weakest.avg}/10.`);
  if (strongest) insights.push(`You're performing strongest in ${strongest.role} at ${strongest.avg}/10.`);
  if (insights.length === 0) insights.push("Complete a few interviews to start seeing personalized insights here.");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Progress Tracking</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Analytics across every interview you've taken.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Object.entries(overall).map(([label, value]) => (
          <div key={label} className="card p-5">
            <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
            <div className="mt-1 font-display text-2xl font-bold">{value}%</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-500 to-brandblue-500"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Scores Over Time</h2>
          {scoreOverTime.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={scoreOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-white/10" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#7c5cff" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Average Score by Role</h2>
          {topicAverages.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topicAverages}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-white/10" />
                <XAxis dataKey="role" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="avg" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
          <Lightbulb size={20} className="text-amber-500" /> AI Insights
        </h2>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {insights.map((ins, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-accent-500">•</span> {ins}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
