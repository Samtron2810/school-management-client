import { useCallback, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";
import AuthContext from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scheduled so the state updates land outside the effect body.
    const id = setTimeout(() => {
      if (token && authService.isTokenExpired(token)) {
        authService.logout();
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    }, 0);
    return () => clearTimeout(id);
  }, [token]);

  const login = useCallback(async (credentials) => {
    const session = await authService.login(credentials);
    setUser(session.user);
    setToken(session.token);
    return session;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const freshUser = await authService.me();
    if (freshUser) {
      setUser(freshUser);
    }
    return freshUser;
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      logout,
      refreshUser,
      token,
      user,
    }),
    [loading, login, logout, refreshUser, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
