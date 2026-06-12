import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearStoredSession,
  getCurrentUser,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  loginRequest,
  logoutRequest,
  refreshAccessToken,
  setStoredSession,
} from "../api/client.js";

const AuthContext = createContext(null);

function isAdminUser(user) {
  return user?.role === "ADMIN";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const clearSession = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    clearStoredSession();
  };

  const persistSession = ({ accessToken: nextAccessToken, refreshToken: nextRefreshToken, user: nextUser }) => {
    setAccessToken(nextAccessToken);
    setRefreshToken(nextRefreshToken);
    setUser(nextUser);
    setStoredSession({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      user: nextUser,
    });
  };

  useEffect(() => {
    const bootstrap = async () => {
      const storedAccessToken = getStoredAccessToken();
      const storedRefreshToken = getStoredRefreshToken();
      const storedUser = getStoredUser();

      if (!storedAccessToken) {
        setLoading(false);
        return;
      }

      if (storedUser && isAdminUser(storedUser)) {
        setUser(storedUser);
      }

      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);

      try {
        const response = await getCurrentUser(storedAccessToken);
        const currentUser = response?.data ?? null;

        if (!isAdminUser(currentUser)) {
          throw new Error("Admin access required.");
        }

        persistSession({
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          user: currentUser,
        });
        setError("");
      } catch (initialError) {
        if (!storedRefreshToken) {
          clearSession();
          setError(initialError.message);
          setLoading(false);
          return;
        }

        try {
          const refreshed = await refreshAccessToken(storedRefreshToken);
          const nextAccessToken = refreshed?.data?.accessToken ?? null;

          if (!nextAccessToken) {
            throw new Error("Unable to refresh session.");
          }

          const currentUserResponse = await getCurrentUser(nextAccessToken);
          const currentUser = currentUserResponse?.data ?? null;

          if (!isAdminUser(currentUser)) {
            throw new Error("Admin access required.");
          }

          persistSession({
            accessToken: nextAccessToken,
            refreshToken: storedRefreshToken,
            user: currentUser,
          });
          setError("");
        } catch (refreshError) {
          clearSession();
          setError(refreshError.message);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email, password) => {
    const response = await loginRequest({ email, password });
    const session = response?.data ?? null;
    const nextUser = session?.user ?? null;

    if (!isAdminUser(nextUser)) {
      throw new Error("Admin access required.");
    }

    persistSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: nextUser,
    });
    setError("");

    return nextUser;
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await logoutRequest(accessToken);
      }
    } catch {
      // Ignore network failures and clear local state.
    } finally {
      clearSession();
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      loading,
      error,
      isAuthenticated: Boolean(user && accessToken),
      login,
      logout,
      setError,
    }),
    [user, accessToken, refreshToken, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}