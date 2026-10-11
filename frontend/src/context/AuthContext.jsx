import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("aip_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("aip_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authAPI
      .me()
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("aip_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem("aip_token");
        localStorage.removeItem("aip_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem("aip_token", res.data.token);
    localStorage.setItem("aip_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await authAPI.register(payload);
    localStorage.setItem("aip_token", res.data.token);
    localStorage.setItem("aip_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("aip_token");
    localStorage.removeItem("aip_user");
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem("aip_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
