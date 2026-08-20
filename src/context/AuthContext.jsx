import React, { createContext, useEffect, useState, useCallback } from "react";
import * as authApi from "../api/authApi";
import { getToken, setToken as persistToken } from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user: me } = await authApi.getMe();
        setUser(me);
      } catch {
        persistToken(null);
        setTokenState(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, token: newToken } = await authApi.login(credentials);
    persistToken(newToken);
    setTokenState(newToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (details) => {
    const { user: newUser, token: newToken } = await authApi.register(details);
    persistToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    persistToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
