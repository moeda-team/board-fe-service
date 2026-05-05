const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const authService = {
    /**
     * Redirects the user to the backend Google OAuth login endpoint.
     * The backend will handle the Google redirect and return a JWT.
     */
    loginWithGoogle: () => {
        window.location.href = `${API_BASE_URL}/api/auth/google`;
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