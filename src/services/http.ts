import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "/api"; // usa .env o proxy

export const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // pon true si tu back usa cookies
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (error) => {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Error de red";
    return Promise.reject(new Error(msg));
  }
);
