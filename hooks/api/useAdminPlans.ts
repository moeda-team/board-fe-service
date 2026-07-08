import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import type {
  AdminPlan,
  CreatePlanDto,
  UpdatePlanDto,
} from "@/types/admin-plan";

const QUERY_KEY = "admin-plans";

export const adminPlansQueryKey = () => [QUERY_KEY] as const;
export const adminPlanQueryKey = (id: string) => [QUERY_KEY, id] as const;

/**
 * GET /api/admin/plans
 * List all subscription plans.
 */
export const useAdminPlans = (enabled = true) =>
  useQuery<AdminPlan[]>({
    queryKey: adminPlansQueryKey(),
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/api/admin/plans");
      return unwrapApiData(data) ?? [];
    },
    enabled,
  });

/**
 * POST /api/admin/plans
 * Create a new subscription plan.
 */
export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Plan created",
      errorMessage: "Failed to create plan",
    },
    mutationFn: async (dto: CreatePlanDto) => {
      const { data } = await apiClient.post<any>("/api/admin/plans", dto);
      return unwrapApiData(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminPlansQueryKey() });
    },
  });
};

/**
 * PATCH /api/admin/plans/:id
 * Update a subscription plan.
 */
export const useUpdatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Plan updated",
      errorMessage: "Failed to update plan",
    },
    mutationFn: async ({ id, dto }: { id: string; dto: UpdatePlanDto }) => {
      const { data } = await apiClient.patch<any>(`/api/admin/plans/${id}`, dto);
      return unwrapApiData(data);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: adminPlansQueryKey() });
      qc.invalidateQueries({ queryKey: adminPlanQueryKey(vars.id) });
    },
  });
};

/**
 * DELETE /api/admin/plans/:id
 * Delete a subscription plan.
 */
export const useDeletePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Plan deleted",
      errorMessage: "Failed to delete plan",
    },
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/admin/plans/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminPlansQueryKey() });
    },
  });
};
