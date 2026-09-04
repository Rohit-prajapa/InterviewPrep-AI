import { createContext, useContext, useEffect, useState } from "react";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getSavedUser,
  isAuthenticated,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);
  const [loading, setLoading] = useState(true);

  // Restore login session when app starts
  useEffect(() => {
    const restoreSession = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        if (response.success) {
          setUser(response.user);
          localStorage.setItem(
            "interviewprep_user",
            JSON.stringify(response.user)
          );
        }
      } catch (error) {
        console.error("Session restoration failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Register
  const register = async (userData) => {
    const response = await registerUser(userData);

    if (response.success) {
      setUser(response.user);
    }

    return response;
  };

  // Login
  const login = async (credentials) => {
    const response = await loginUser(credentials);

    if (response.success) {
      setUser(response.user);
    }

    return response;
  };

  // Logout
  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export default AuthContext;