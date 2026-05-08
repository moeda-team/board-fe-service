"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setApiToken } from "@/lib/apiClient";

export function ApiAuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "authenticated" && session?.accessToken) {
            setApiToken(session.accessToken);
        } else if (status === "unauthenticated") {
            setApiToken(null);
        }
    }, [session, status]);

    return children;
}
