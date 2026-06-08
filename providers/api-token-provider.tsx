"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setApiToken } from "@/lib/apiClient";

/**
 * Globally syncs the NextAuth session token into the shared apiClient on every
 * route (including public pages like /, /pricing, /payment). Unlike
 * ApiAuthProvider it does NOT redirect unauthenticated users, so logged-in
 * users keep their session when navigating outside the (app) route group.
 */
export function ApiTokenProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      setApiToken(session.accessToken);
    } else if (status === "unauthenticated") {
      setApiToken(null);
    }
  }, [session, status]);

  return <>{children}</>;
}
