// src/context/AuthContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem("Authorization");
      const role = localStorage.getItem("Role");
      const email = localStorage.getItem("Email");
      const rememberMe = localStorage.getItem("rememberMe") === "true";

      if (token && role && rememberMe) {
        setUser({ role, token, email });
      } else {
        // Clear invalid or incomplete auth data
        clearAuthData();
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem("Authorization");
    localStorage.removeItem("Role");
    localStorage.removeItem("Email");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("user-data-storage");
    localStorage.removeItem("crop-storage");
    localStorage.removeItem("farmer-storage");
    localStorage.removeItem("verifier-storage");
    // localStorage.setItem("rememberMe", "false");
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    clearAuthData();
    router.push("/login");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
