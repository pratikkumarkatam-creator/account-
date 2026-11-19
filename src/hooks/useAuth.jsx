import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .me()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const handleExpired = () => setUser(null);
    window.addEventListener("auth:expired", handleExpired);

    return () => {
      active = false;
      window.removeEventListener("auth:expired", handleExpired);
    };
  }, []);

  const login = useCallback(async (username, password, remember) => {
    const data = await api.login({ username, password, remember });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await api.me();
    setUser(data.user);
    return data.user;
  }, []);

  const updateUser = useCallback((nextUser) => setUser(nextUser), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshUser,
      updateUser,
      isAdmin: user?.role === "admin",
    }),
    [user, loading, login, logout, refreshUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
