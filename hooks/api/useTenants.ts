import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData } from "@/types/api";
import { Tenant, TenantsEnvelope } from "@/types/type-tenants";

export const useTenants = () => {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async (): Promise<Tenant[]> => {
      const { data } = await apiClient.get<TenantsEnvelope>("/api/tenants");
      return unwrapApiArrayData(data);
    },
  });
};
