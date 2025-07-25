import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount and handle OAuth callback
  useEffect(() => {
    const checkExistingSession = () => {
      // Check for OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search);
      const auth = urlParams.get("auth");
      const type = urlParams.get("type");
      const token = urlParams.get("token");
      const userParam = urlParams.get("user");

      if (auth === "success" && token && userParam) {
        try {
          const oauthUser = JSON.parse(decodeURIComponent(userParam));
          const userData: User = {
            id: oauthUser.id,
            fullName: oauthUser.name,
            email: oauthUser.email,
            createdAt: oauthUser.created_at,
          };

          setUser(userData);
          localStorage.setItem("adx_sigma_user", JSON.stringify(userData));
          localStorage.setItem("adx_sigma_token", token);

          // Clean up URL parameters
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Error processing OAuth callback:", error);
        }
      }

      // Handle OAuth errors
      const error = urlParams.get("error");
      if (error) {
        console.error("OAuth error:", error);
        // Clean up URL parameters
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }

      // Check for existing session
      const storedUser = localStorage.getItem("adx_sigma_user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          localStorage.removeItem("adx_sigma_user");
          localStorage.removeItem("adx_sigma_token");
        }
      }
      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check if user exists in localStorage (simulate database check)
    const existingUsers = JSON.parse(
      localStorage.getItem("adx_sigma_users") || "[]",
    );
    const existingUser = existingUsers.find((u: any) => u.email === email);

    if (existingUser && existingUser.password === password) {
      const userData: User = {
        id: existingUser.id,
        fullName: existingUser.fullName,
        email: existingUser.email,
        createdAt: existingUser.createdAt,
      };

      setUser(userData);
      localStorage.setItem("adx_sigma_user", JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if user already exists
    const existingUsers = JSON.parse(
      localStorage.getItem("adx_sigma_users") || "[]",
    );
    const userExists = existingUsers.some((u: any) => u.email === email);

    if (userExists) {
      setIsLoading(false);
      return false;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      password, // In real app, this would be hashed
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage (simulate database)
    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem("adx_sigma_users", JSON.stringify(updatedUsers));

    // Create user session
    const userData: User = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };

    setUser(userData);
    localStorage.setItem("adx_sigma_user", JSON.stringify(userData));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("adx_sigma_user");
    localStorage.removeItem("adx_sigma_token");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
