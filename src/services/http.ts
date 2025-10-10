import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "/api",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Error de red";
    return Promise.reject(new Error(msg));
  }
);
