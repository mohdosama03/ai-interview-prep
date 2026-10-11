import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, Sparkles, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/#features", label: "Features" },
  { to: "/questions", label: "Interview Practice" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-white/5 dark:bg-navy-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-brandblue-500 text-white">
            <Sparkles size={18} />
          </span>
          <span>
            AI Interview <span className="text-accent-500">Prep</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-accent-500 ${
                  isActive ? "text-accent-500" : "text-slate-600 dark:text-slate-300"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-secondary !px-4 !py-2 text-sm">
                <LayoutDashboard size={16} /> {user?.name?.split(" ")[0] || "Dashboard"}
              </Link>
              <button onClick={handleLogout} className="btn-primary !px-4 !py-2 text-sm">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-4 !py-2 text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-white/5 dark:bg-navy-950 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-sm font-medium">
                {link.label}
              </Link>
            ))}
            <button onClick={toggleTheme} className="flex items-center gap-2 text-sm font-medium">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} Toggle theme
            </button>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-primary w-full justify-center text-sm">
                Logout
              </button>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center text-sm">
                  Login
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 justify-center text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
