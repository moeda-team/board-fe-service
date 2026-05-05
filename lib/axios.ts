import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach auth token if present
apiClient.interceptors.request.use(
  (config) => {
    // Example: const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — unwrap data or handle global errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling (e.g. 401 redirect) can go here
    return Promise.reject(error);
  },
);

export default apiClient;
