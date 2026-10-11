import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import { interviewAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";

const JOB_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "MERN Stack Developer",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "Software Engineer",
];
const EXPERIENCE = ["Fresher", "Junior", "Intermediate", "Experienced"];
const TYPES = ["Technical", "HR", "Behavioral", "Coding"];
const DIFFICULTY = ["Easy", "Medium", "Hard"];

function OptionGrid({ label, options, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              value === opt
                ? "border-accent-500 bg-accent-500/10 text-accent-600 dark:text-accent-400"
                : "border-slate-200 text-slate-600 hover:border-accent-300 dark:border-white/10 dark:text-slate-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function InterviewSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    jobRole: user?.role || JOB_ROLES[2],
    experienceLevel: user?.experienceLevel || "Fresher",
    interviewType: "Technical",
    difficulty: "Medium",
  });
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await interviewAPI.create({ ...form, questionCount: 5 });
      navigate(`/interview/${res.data.interview._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold">Set up your interview</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Choose a role, format, and difficulty to get matching interview questions.
        </p>
      </div>

      <div className="card space-y-6 p-8">
        <OptionGrid
          label="Job Role"
          options={JOB_ROLES}
          value={form.jobRole}
          onChange={(v) => setForm({ ...form, jobRole: v })}
        />
        <OptionGrid
          label="Experience Level"
          options={EXPERIENCE}
          value={form.experienceLevel}
          onChange={(v) => setForm({ ...form, experienceLevel: v })}
        />
        <OptionGrid
          label="Interview Type"
          options={TYPES}
          value={form.interviewType}
          onChange={(v) => setForm({ ...form, interviewType: v })}
        />
        <OptionGrid
          label="Difficulty"
          options={DIFFICULTY}
          value={form.difficulty}
          onChange={(v) => setForm({ ...form, difficulty: v })}
        />

        <button onClick={handleStart} disabled={loading} className="btn-primary w-full justify-center text-base">
          <PlayCircle size={18} /> {loading ? "Preparing questions..." : "Start Interview"}
        </button>
      </div>
    </div>
  );
}
