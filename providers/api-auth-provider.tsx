"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setApiToken } from "@/lib/apiClient";

export function ApiAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [tokenSynced, setTokenSynced] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      setApiToken(session.accessToken);
      setTokenSynced(true);
    } else if (status === "unauthenticated") {
      setApiToken(null);
      setTokenSynced(true);
      router.replace("/login");
    }
  }, [session, status, router]);

  if (status === "loading" || !tokenSynced) {
    return null;
  }

  return children;
}
