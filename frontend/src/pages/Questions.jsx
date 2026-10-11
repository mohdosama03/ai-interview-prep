import React, { useEffect, useState } from "react";
import { Search, Bookmark, BookmarkCheck } from "lucide-react";
import { questionAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import Loader from "../components/Loader.jsx";

const CATEGORIES = ["", "JavaScript", "React", "Node.js", "MongoDB", "HR", "Behavioral", "Coding"];
const DIFFICULTIES = ["", "Easy", "Medium", "Hard"];

export default function Questions() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [savedIds, setSavedIds] = useState(new Set());

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      const res = await questionAPI.list(params);
      setQuestions(res.data.questions);
    } catch (err) {
      toast.error("Could not load question bank. Make sure the backend is running and seeded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchQuestions, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, difficulty]);

  const handleSave = async (qId) => {
    if (!isAuthenticated) {
      toast.info("Log in to save questions");
      return;
    }
    try {
      const res = await questionAPI.toggleSave(qId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (res.data.saved) next.add(qId);
        else next.delete(qId);
        return next;
      });
    } catch {
      toast.error("Could not save question");
    }
  };

  const difficultyColor = {
    Easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Hard: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Question Bank</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Search and filter technical and HR interview questions.
        </p>
      </div>

      <div className="card mb-6 flex flex-wrap gap-3 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="input-field input-with-icon"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field w-auto">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c || "All Topics"}
            </option>
          ))}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field w-auto">
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d || "All Difficulties"}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : questions.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          No questions found. Run <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-white/10">npm run seed</code>{" "}
          in the backend to populate the question bank.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {questions.map((q) => {
            const isSaved = savedIds.has(q._id) || (user && q.savedBy?.includes(user._id));
            return (
              <div key={q._id} className="card p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-accent-500/10 text-accent-600 dark:text-accent-400">{q.category}</span>
                    <span className={`badge ${difficultyColor[q.difficulty] || ""}`}>{q.difficulty}</span>
                  </div>
                  <button
                    onClick={() => handleSave(q._id)}
                    aria-label="Save question"
                    className="text-slate-400 hover:text-accent-500"
                  >
                    {isSaved ? <BookmarkCheck size={18} className="text-accent-500" /> : <Bookmark size={18} />}
                  </button>
                </div>
                <p className="text-sm font-medium leading-relaxed">{q.question}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
