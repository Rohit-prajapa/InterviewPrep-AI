import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "interviewprep_token"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (!error.response) {
      error.message =
        "Unable to connect to the server. Please check your connection.";
    }

    if (error.response?.status === 401) {
      localStorage.removeItem(
        "interviewprep_token"
      );

      localStorage.removeItem(
        "interviewprep_user"
      );

      if (
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 429) {
      error.message =
        error.response?.data?.message ||
        "Too many requests. Please try again later.";
    }

    if (error.response?.status >= 500) {
      error.message =
        error.response?.data?.message ||
        "Server error. Please try again later.";
    }

    return Promise.reject(error);
  }
);

export default api;