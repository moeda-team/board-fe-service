import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { Tenant } from "@/types/api";

export const fetchTenants = async (): Promise<Tenant[]> => {
  const { data } = await apiClient.get("/api/tenants");
  return data;
};

export const useTenants = () => {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: fetchTenants,
  });
};
