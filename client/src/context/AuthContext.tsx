import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, userService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setAuthData = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("offline_identity");
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      // 1. Get cache first
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      // 2. If no token, we aren't logged in. stop immediately.
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // 3. Set user from cache immediately so the UI doesn't flicker or loop
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // 4. Validate with server ONLY if online
      if (navigator.onLine) {
        try {
          const data = await userService.getMe();
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        } catch (err: any) {
          console.error("Session validation failed:", err);
          // Only log out if the server explicitly says the token is invalid (401)
          if (err.response?.status === 401) {
            logout();
          }
        }
      }

      // 5. Finalize loading ONCE
      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login: setAuthData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// This is the hook you were missing!
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};