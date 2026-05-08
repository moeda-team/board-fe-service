import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import {
  AuthGoogleEnvelope,
  AuthGoogleResponse,
  AuthMeEnvelope,
  AuthMeResponse
} from "@/types/type-auth";

export const useLoginGoogle = () => {
  return useQuery({
    queryKey: ["auth", "google"],
    queryFn: async (): Promise<AuthGoogleResponse> => {
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");
      const client = isLocal ? "local" : "dev";
      const { data } = await apiClient.get<AuthGoogleEnvelope>(`/api/auth/google?client=${client}`);
      return unwrapApiData(data);
    },
  });
};

export const useAuthGoogleCallback = () => {
  return useQuery({
    queryKey: ["auth", "google", "callback"],
    queryFn: async (): Promise<AuthGoogleResponse> => {
      const { data } = await apiClient.get<AuthGoogleEnvelope>("/api/auth/google/callback");
      return unwrapApiData(data);
    },
  });
};

export const useAuthMe = () => {
  const { status } = useSession();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<AuthMeResponse> => {
      const { data } = await apiClient.get<AuthMeEnvelope>("/api/auth/me");
      return unwrapApiData(data);
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: status === "authenticated",
  });
};
