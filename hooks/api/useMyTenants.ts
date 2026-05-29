import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import { AuthMeEnvelope } from "@/types/type-auth";
import { AuthMeTenant } from "@/types/api";

export const useMyTenants = () => {
  return useQuery<AuthMeTenant[]>({
    queryKey: ["my-tenants"],
    queryFn: async () => {
      const { data } = await apiClient.get<AuthMeEnvelope>("/api/auth/me");
      return unwrapApiData(data).tenants;
    },
  });
};
