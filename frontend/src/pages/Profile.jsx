import React, { useState } from "react";
import { User, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { userAPI } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";

const ROLES = [
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

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || "",
    role: user?.role || ROLES[0],
    experienceLevel: user?.experienceLevel || "Fresher",
    skills: (user?.skills || []).join(", "),
    password: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        role: form.role,
        experienceLevel: form.experienceLevel,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (form.password) payload.password = form.password;

      const res = await userAPI.updateProfile(payload);
      updateUser(res.data.user);
      setForm((f) => ({ ...f, password: "" }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-brandblue-500 text-2xl font-bold text-white">
          {user?.name?.[0]?.toUpperCase() || <User />}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{user?.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Target Job Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="input-field">
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Experience Level</label>
            <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className="input-field">
              {EXPERIENCE.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Skills (comma separated)</label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">New Password (optional)</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
            className="input-field"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
          <Save size={16} /> {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
