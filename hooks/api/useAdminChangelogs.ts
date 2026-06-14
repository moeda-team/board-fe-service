import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import type {
  Changelog,
  ChangelogEnvelope,
  ChangelogFormDto,
  ChangelogListEnvelope,
  CreateChangelogParams,
  DeleteChangelogParams,
  UpdateChangelogParams
} from "@/types/type-changelogs";

const QUERY_KEY = "admin-changelogs";

export const adminChangelogsQueryKey = () => [QUERY_KEY] as const;
export const adminChangelogQueryKey = (id: string) =>
  [QUERY_KEY, id] as const;

const buildChangelogFormData = (dto: ChangelogFormDto): FormData => {
  const formData = new FormData();
  if (dto.version) formData.append("version", dto.version);
  formData.append("title", dto.title);
  formData.append("content", dto.content);
  if (dto.releaseDate) formData.append("releaseDate", dto.releaseDate);
  // NOTE: Backend currently rejects these extra properties (400 error).
  // Kept commented for future use when the API supports them.
  // if (dto.menu) formData.append("menu", dto.menu);
  // if (dto.youtubeUrl) formData.append("youtubeUrl", dto.youtubeUrl);
  // if (dto.highlights?.length) {
  //   dto.highlights
  //     .filter((h) => h.trim())
  //     .forEach((h) => formData.append("highlights", h));
  // }
  // if (typeof dto.isDraft === "boolean") {
  //   formData.append("isDraft", String(dto.isDraft));
  // }
  if (dto.attachments?.length) {
    dto.attachments.forEach((file) => formData.append("attachments", file));
  }
  return formData;
};

/**
 * GET /api/admin/changelogs
 * List all changelogs (Super Admin).
 */
export const useAdminChangelogs = (enabled = true) =>
  useQuery<Changelog[]>({
    queryKey: adminChangelogsQueryKey(),
    queryFn: async () => {
      const { data } =
        await apiClient.get<ChangelogListEnvelope>("/api/admin/changelogs");
      return unwrapApiData(data)?.items ?? [];
    },
    enabled
  });

/**
 * GET /api/admin/changelogs/:id
 * Get changelog detail (Super Admin).
 */
export const useAdminChangelog = (id: string | null) =>
  useQuery<Changelog>({
    queryKey: adminChangelogQueryKey(id ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<ChangelogEnvelope>(
        `/api/admin/changelogs/${id}`
      );
      return unwrapApiData(data);
    },
    enabled: !!id
  });

/**
 * POST /api/admin/changelogs
 * Create changelog with optional attachments (Super Admin).
 */
export const useCreateChangelog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Changelog created",
      errorMessage: "Failed to create changelog"
    },
    mutationFn: async ({ dto }: CreateChangelogParams): Promise<Changelog> => {
      const { data } = await apiClient.post<ChangelogEnvelope>(
        "/api/admin/changelogs",
        buildChangelogFormData(dto),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return unwrapApiData(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminChangelogsQueryKey()
      });
    }
  });
};

/**
 * PUT /api/admin/changelogs/:id
 * Update changelog with optional attachments (Super Admin).
 */
export const useUpdateChangelog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Changelog updated",
      errorMessage: "Failed to update changelog"
    },
    mutationFn: async ({
      id,
      dto
    }: UpdateChangelogParams): Promise<Changelog> => {
      const { data } = await apiClient.put<ChangelogEnvelope>(
        `/api/admin/changelogs/${id}`,
        buildChangelogFormData(dto),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: adminChangelogsQueryKey()
      });
      await queryClient.invalidateQueries({
        queryKey: adminChangelogQueryKey(variables.id)
      });
    }
  });
};

/**
 * DELETE /api/admin/changelogs/:id
 * Delete changelog (Super Admin).
 */
export const useDeleteChangelog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Changelog deleted",
      errorMessage: "Failed to delete changelog"
    },
    mutationFn: async ({ id }: DeleteChangelogParams): Promise<void> => {
      await apiClient.delete(`/api/admin/changelogs/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminChangelogsQueryKey()
      });
    }
  });
};
