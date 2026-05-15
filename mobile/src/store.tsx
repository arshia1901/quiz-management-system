/**
 * mobile/src/store.ts
 * Auth state management — stores user info + JWT in AsyncStorage.
 * Exposes a React Context so any screen can read/update auth state.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken } from "./api";

export interface AuthUser {
  user_id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  token: string;
  batch_id?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

const USER_KEY = "examify_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from storage on app start
  useEffect(() => {
    AsyncStorage.getItem(USER_KEY)
      .then((raw) => {
        if (raw) {
          const parsed: AuthUser = JSON.parse(raw);
          setUser(parsed);
          setToken(parsed.token);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (userData: AuthUser) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    await setToken(userData.token);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(USER_KEY);
    await setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
