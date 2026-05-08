import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData } from "@/types/api";
import { Permission, PermissionsEnvelope } from "@/types/type-master-data";

export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async (): Promise<Permission[]> => {
      const { data } = await apiClient.get<PermissionsEnvelope>("/api/permissions");
      return unwrapApiArrayData(data);
    },
  });
};
