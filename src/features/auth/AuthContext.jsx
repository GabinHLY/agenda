import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { clearStoredAuth, readStoredAuth, saveStoredAuth } from "./auth-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStoredAuth());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!auth.token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await apiRequest("/api/auth/me", { token: auth.token });
        const nextAuth = { token: auth.token, user: response.user };
        setAuth(nextAuth);
        saveStoredAuth(nextAuth.token, nextAuth.user);
      } catch {
        clearStoredAuth();
        setAuth({ token: null, user: null });
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrap();
  }, []);

  async function register(input) {
    const response = await apiRequest("/api/auth/register", {
      method: "POST",
      body: input,
    });
    const nextAuth = { token: response.token, user: response.user };
    setAuth(nextAuth);
    saveStoredAuth(nextAuth.token, nextAuth.user);
  }

  async function login(input) {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: input,
    });
    const nextAuth = { token: response.token, user: response.user };
    setAuth(nextAuth);
    saveStoredAuth(nextAuth.token, nextAuth.user);
  }

  function logout() {
    clearStoredAuth();
    setAuth({ token: null, user: null });
  }

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token),
      isBootstrapping,
      register,
      login,
      logout,
    }),
    [auth, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
