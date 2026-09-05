import api from "./api";

// Get current user's profile
export const getProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

// Update current user's profile
export const updateProfile = async (profileData) => {
  const response = await api.put(
    "/users/profile",
    profileData
  );

  return response.data;
};