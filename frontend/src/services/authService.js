import api from "./api";

// Register new user
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  if (response.data.success) {
    localStorage.setItem("interviewprep_token", response.data.token);
    localStorage.setItem(
      "interviewprep_user",
      JSON.stringify(response.data.user)
    );
  }

  return response.data;
};

// Login existing user
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  if (response.data.success) {
    localStorage.setItem("interviewprep_token", response.data.token);
    localStorage.setItem(
      "interviewprep_user",
      JSON.stringify(response.data.user)
    );
  }

  return response.data;
};

// Get currently logged-in user
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Logout user
export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("interviewprep_token");
    localStorage.removeItem("interviewprep_user");
  }
};

// Get saved user from localStorage
export const getSavedUser = () => {
  const user = localStorage.getItem("interviewprep_user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("interviewprep_user");
    return null;
  }
};

// Check whether token exists
export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("interviewprep_token"));
};