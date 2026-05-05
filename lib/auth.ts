const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const authService = {
    /**
     * Redirects the user to the backend Google OAuth login endpoint.
     * The backend handles the Google redirect and returns a JWT.
     *
     * Endpoint: GET /api/auth/google
     */
    loginWithGoogle: () => {
        window.location.href = `${API_BASE_URL}/auth/google?client=local`;
    },

    /**
     * Saves the JWT token to localStorage.
     */
    saveToken: (token: string) => {
        localStorage.setItem("access_token", token);
    },

    /**
     * Retrieves the JWT token from localStorage.
     */
    getToken: (): string | null => {
        return localStorage.getItem("access_token");
    },

    /**
     * Removes the JWT token (logout).
     */
    logout: () => {
        localStorage.removeItem("access_token");
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem("access_token");
    },
};
