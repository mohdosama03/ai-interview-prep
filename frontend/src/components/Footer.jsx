import React from "react";
import { Link } from "react-router-dom";
import BrandMark from "./BrandMark.jsx";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-white/5 dark:bg-navy-950">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2 font-display text-lg font-bold">
              <BrandMark />
              AI Interview Prep
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Practice smarter with AI-generated mock interviews, instant feedback, and progress tracking
              built for job seekers.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/questions" className="hover:text-accent-500">Practice</Link></li>
              <li><Link to="/dashboard" className="hover:text-accent-500">Dashboard</Link></li>
              <li><Link to="/#features" className="hover:text-accent-500">Features</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/about" className="hover:text-accent-500">About</Link></li>
              <li><a href="#" className="hover:text-accent-500">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-accent-500">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent-500">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-400 dark:border-white/5">
          © {new Date().getFullYear()} AI Interview Prep. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
