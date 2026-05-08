import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "backend-jwt",
            name: "Backend JWT",
            credentials: {
                token: { label: "JWT Token", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.token) return null;

                // Try to validate the token by calling the backend
                try {
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
                        {
                            headers: {
                                Authorization: `Bearer ${credentials.token}`,
                            },
                        }
                    );

                    if (res.ok) {
                        const user = await res.json();
                        return {
                            id: String(user.id ?? user.sub ?? "user"),
                            name: user.name ?? user.displayName ?? null,
                            email: user.email ?? null,
                            image: user.picture ?? user.image ?? null,
                            accessToken: credentials.token,
                        };
                    }
                } catch {
                    // /api/auth/me not available — fall through
                }

                // Fallback: trust the backend-issued token without validation
                return {
                    id: "user",
                    accessToken: credentials.token,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as unknown as Record<string, unknown>).accessToken as string | undefined;
                token.sub = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            if (token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};
