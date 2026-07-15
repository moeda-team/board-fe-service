import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import type {
  AdminFeedback,
  AdminFeedbackListResponse,
  UpdateFeedbackStatusDto,
} from "@/types/admin-feedback";

const QUERY_KEY = "admin-feedbacks";

export const adminFeedbacksQueryKey = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => [QUERY_KEY, params] as const;

export const adminFeedbackQueryKey = (id: string) =>
  [QUERY_KEY, "detail", id] as const;

/**
 * GET /api/admin/feedbacks
 * List all feedbacks (Super Admin).
 */
export const useAdminFeedbacks = (
  params: { page?: number; limit?: number; status?: string } = {},
  enabled = true
) =>
  useQuery<AdminFeedbackListResponse>({
    queryKey: adminFeedbacksQueryKey(params),
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/api/admin/feedbacks", {
        params,
      });
      return unwrapApiData(data);
    },
    enabled,
  });

/**
 * GET /api/admin/feedbacks/:id
 * Get single feedback detail.
 */
export const useAdminFeedback = (id: string | null) =>
  useQuery<AdminFeedback>({
    queryKey: adminFeedbackQueryKey(id ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/api/admin/feedbacks/${id}`
      );
      return unwrapApiData(data);
    },
    enabled: !!id,
  });

/**
 * PATCH /api/admin/feedbacks/:id/status
 * Update feedback status.
 */
export const useUpdateFeedbackStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Feedback status updated",
      errorMessage: "Failed to update feedback status",
    },
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateFeedbackStatusDto;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/api/admin/feedbacks/${id}/status`,
        dto
      );
      return unwrapApiData(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
