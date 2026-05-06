import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { Permission } from "@/types/api";

export const fetchPermissions = async (): Promise<Permission[]> => {
  const { data } = await apiClient.get("/api/permissions");
  return data;
};

export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });
};
