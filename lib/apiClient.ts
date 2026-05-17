import axios from "axios";
import { signOut } from "next-auth/react";

let currentToken: string | null = null;
let isRedirecting401 = false;

export function setApiToken(token: string | null) {
    currentToken = token;
}

const apiClient = axios.create({
    // Use the proxy by default in the browser (empty baseURL uses current origin)
    baseURL: typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL : "",
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT token to every request
apiClient.interceptors.request.use((config) => {
    if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
});

// Handle 401 Unauthorized — redirect to login
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const responseData = error.response?.data;
        if (status) {
            console.error(`[apiClient] HTTP ${status}`, responseData ?? error.message);
        } else {
            console.error("[apiClient] Network/Request error:", error.message);
        }
        if (status === 401 && !isRedirecting401) {
            isRedirecting401 = true;
            setApiToken(null);
            signOut({ callbackUrl: "/login" });
        }
        return Promise.reject(error);
    }
);

export default apiClient;
