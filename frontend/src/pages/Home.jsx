import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Code2,
  Users,
  Zap,
  TrendingUp,
  Target,
  UserPlus,
  ClipboardList,
  MessageSquareText,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const TRANSCRIPT_LINES = [
  { who: "AI", text: "Explain the difference between let, const, and var in JavaScript." },
  { who: "You", text: "let and const are block-scoped, var is function-scoped..." },
  { who: "AI", text: "Great — can you give an example of a closure using this?" },
];

function LiveTranscript() {
  const [visibleChars, setVisibleChars] = useState(0);
  const fullText = TRANSCRIPT_LINES.map((l) => l.text).join("");

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleChars((c) => (c < fullText.length ? c + 2 : 0));
    }, 40);
    return () => clearInterval(interval);
  }, [fullText.length]);

  let remaining = visibleChars;

  return (
    <div className="card w-full max-w-md space-y-4 p-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-white/5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 text-xs font-medium text-slate-400">Mock Interview — Live</span>
      </div>
      {TRANSCRIPT_LINES.map((line, i) => {
        const show = Math.max(0, Math.min(line.text.length, remaining));
        remaining -= line.text.length;
        if (show <= 0) return null;
        return (
          <div key={i} className="flex gap-3 text-sm">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                line.who === "AI" ? "bg-accent-500" : "bg-brandblue-500"
              }`}
            >
              {line.who === "AI" ? "AI" : "Y"}
            </span>
            <p className="text-slate-600 dark:text-slate-300">
              {line.text.slice(0, show)}
              {show < line.text.length && <span className="caret" />}
            </p>
          </div>
        );
      })}
    </div>
  );
}

const features = [
  { icon: Bot, title: "AI Mock Interviews", desc: "Simulated interviewer that asks real, role-specific questions on demand." },
  { icon: Code2, title: "Technical Interview Practice", desc: "JavaScript, React, Node.js, MongoDB and DSA questions by difficulty." },
  { icon: Users, title: "HR Interview Practice", desc: "Behavioral and HR rounds so you're ready beyond the whiteboard." },
  { icon: Zap, title: "Instant AI Feedback", desc: "Scores on technical accuracy, communication, confidence and relevance." },
  { icon: TrendingUp, title: "Progress Tracking", desc: "Visual charts of your improvement across every skill area over time." },
  { icon: Target, title: "Personalized Questions", desc: "Recommendations that target your weakest topics automatically." },
];

const steps = [
  { icon: UserPlus, title: "Create Account", desc: "Sign up in seconds and set your target role." },
  { icon: ClipboardList, title: "Select Job Role", desc: "Pick a role, experience level and difficulty." },
  { icon: MessageSquareText, title: "Take AI Interview", desc: "Answer real interview questions at your pace." },
  { icon: Rocket, title: "Get Feedback & Improve", desc: "Review AI scoring and sharpen weak areas." },
];

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "MERN Stack Developer",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "Software Engineer",
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const practiceLink = isAuthenticated ? "/interview" : "/register";

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(124,92,255,0.15),_transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="badge mb-5 border border-accent-500/30 bg-accent-500/10 text-accent-600 dark:text-accent-400">
              Now with AI-generated feedback
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
              Prepare Smarter.
              <br />
              Interview Better.
              <br />
              <span className="bg-gradient-to-r from-accent-500 to-brandblue-500 bg-clip-text text-transparent">
                Get Hired.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-600 dark:text-slate-300">
              Practice technical and HR interviews with AI-powered questions, instant feedback, and
              personalized preparation.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={practiceLink} className="btn-primary text-base">
                Start Practicing <ArrowRight size={18} />
              </Link>
              <Link to={practiceLink} className="btn-secondary text-base">
                Try Mock Interview
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="animate-float">
              <LiveTranscript />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Everything you need to walk in ready</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
            One platform for technical prep, HR rounds, and honest feedback on where you stand.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6 transition-transform hover:-translate-y-1">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/15 to-brandblue-500/15 text-accent-500">
                <f.icon size={22} />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 dark:bg-navy-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">How it works</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-brandblue-500 font-display text-lg font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mb-1 font-display font-semibold">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular roles */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Popular roles</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
            Choose a track and get questions tailored to that role.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {roles.map((role) => (
            <Link
              key={role}
              to={practiceLink}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-accent-500 hover:text-accent-600 dark:border-white/10 dark:bg-navy-800 dark:text-slate-300"
            >
              {role}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="card relative overflow-hidden bg-gradient-to-br from-navy-900 to-navy-800 px-8 py-14 text-center text-white dark:from-navy-800 dark:to-navy-700">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,92,255,0.25),_transparent_65%)]" />
          <h2 className="font-display text-3xl font-bold md:text-4xl">Ready for your next interview?</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-300">
            Start a free AI mock interview and see exactly where you stand.
          </p>
          <Link to={practiceLink} className="btn-primary mt-8 inline-flex text-base">
            Start Your AI Interview <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
