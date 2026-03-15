/* AuthContext - migrated from React Native */
/* Replaces expo-secure-store with localStorage */
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { login as apiLogin, signup as apiSignup, getProfile } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  balance: string;
  wallet_id: string;
  currency: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isLoggedIn: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const res = await getProfile();
          setState({
            user: res.data.user,
            token: storedToken,
            isLoading: false,
            isLoggedIn: true,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        localStorage.removeItem('token');
        setState({ user: null, token: null, isLoading: false, isLoggedIn: false });
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    const { token } = res.data;
    localStorage.setItem('token', token);
    const profileRes = await getProfile();
    setState({ user: profileRes.data.user, token, isLoading: false, isLoggedIn: true });
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      await apiSignup(name, email, password);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({ user: null, token: null, isLoading: false, isLoggedIn: false });
  }, []);

  const refreshProfile = useCallback(async () => {
    const res = await getProfile();
    setState(prev => ({ ...prev, user: res.data.user }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, signup, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
