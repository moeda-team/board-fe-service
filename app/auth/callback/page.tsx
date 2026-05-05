"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { authService } from "@/lib/auth";

/**
 * Handles the redirect from the backend after Google OAuth completes.
 *
 * OAuth flow:
 *   1. User clicks "Continue with Google" → browser redirected to GET /api/auth/google
 *   2. Backend initiates Google OAuth
 *   3. Google redirects to backend GET /api/auth/google/callback
 *   4. Backend exchanges code for token, then redirects here:
 *      /auth/callback?token=<JWT>
 *   5. This page saves the JWT and redirects to /dashboard
 */
function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      authService.saveToken(token);
      router.replace("/dashboard");
    } else {
      router.replace("/login?error=oauth_failed");
    }
  }, [router, searchParams]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}

// Suspense boundary required by Next.js when using useSearchParams in a Client Component
export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
