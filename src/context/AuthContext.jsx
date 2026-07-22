import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && authService.isTokenExpired(token)) {
      authService.logout();
      setUser(null);
      setToken(null);
    }

    setLoading(false);
  }, [token]);

  const login = useCallback(async (credentials) => {
    const session = await authService.login(credentials);
    setUser(session.user);
    setToken(session.token);
    return session;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      logout,
      token,
      user,
    }),
    [loading, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
