import { signOut } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const authService = {
    /**
     * Redirects the user to the backend Google OAuth login endpoint.
     * The backend handles the Google redirect and returns a JWT.
     */
    loginWithGoogle: () => {
        const isLocal =
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1");
        const client = isLocal ? "local" : "dev";
        window.location.href = `${API_BASE_URL}/api/auth/google?client=${client}`;
    },

    /**
     * Deprecated: token is now stored securely in an HTTP-only cookie by NextAuth.
     * Use `signIn("backend-jwt", { token })` instead.
     */
    saveToken: (_token: string) => {
        console.warn(
            "saveToken is deprecated. Token is managed securely by NextAuth."
        );
    },

    /**
     * Deprecated: token is stored in an HTTP-only cookie and cannot be read from JS.
     * Use `useSession()` from "next-auth/react" instead.
     */
    getToken: (): string | null => {
        return null;
    },

    /**
     * Signs the user out via NextAuth and clears the secure session cookie.
     */
    logout: async () => {
        await signOut({ callbackUrl: "/login" });
    },

    /**
     * Deprecated: use `useSession()` or server-side `auth()` instead.
     */
    isAuthenticated: (): boolean => {
        return false;
    },
};
