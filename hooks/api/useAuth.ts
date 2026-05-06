import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export const fetchAuthGoogle = async (): Promise<any> => {
  const { data } = await apiClient.get("/api/auth/google");
  return data;
};

export const fetchAuthGoogleCallback = async (): Promise<any> => {
  const { data } = await apiClient.get("/api/auth/google/callback");
  return data;
};

export const useLoginGoogle = () => {
  return useQuery({
    queryKey: ["auth", "google"],
    queryFn: fetchAuthGoogle,
  });
};

export const useAuthGoogleCallback = () => {
  return useQuery({
    queryKey: ["auth", "google", "callback"],
    queryFn: fetchAuthGoogleCallback,
  });
};
