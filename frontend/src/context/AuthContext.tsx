import React, { createContext, useState, useEffect, useContext } from "react";
import {
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/auth.service";
import { toast } from "react-toastify";

interface User {
  _id: string;
  email: string;
  role: string;
  employeeId?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUser(userData);
          setIsAuthenticated(true);
          // Store user data in localStorage for other services to access
          localStorage.setItem("user_data", JSON.stringify(userData));
        } catch (error) {
          console.error("Failed to load user:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user_data");
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email: string, lastName: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { token: newToken, user: userData } = await loginUser(
        email,
        lastName
      );

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      // Store user data in localStorage for other services to access
      localStorage.setItem("user_data", JSON.stringify(userData));
      toast.success("Login successful!");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your email and last name.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Call backend logout for logging purposes (optional)
    if (token) {
      try {
        await logoutUser(token);
      } catch (error) {
        console.warn("Backend logout failed, proceeding with client logout");
      }
    }

    // Clear client-side state
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.info("You have been logged out.");
  };

  const setUserState = (user: User | null) => {
    setUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        setUser: setUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
