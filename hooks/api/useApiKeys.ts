import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import {
  ApiKey,
  ApiKeyEnvelope,
  GenerateApiKeyParams,
  RevokeApiKeyParams
} from "@/types/type-api-keys";

// Remove the old ApiKeysEnvelope import — GET returns a single object, not array

const QUERY_KEY = "api-keys";

/**
 * GET /api/tenants/:tenantId/api-keys
 * Returns the single active key (without secret), or null if none exists.
 */
export const useTenantApiKey = (tenantId: string) =>
  useQuery({
    queryKey: [QUERY_KEY, tenantId],
    queryFn: async (): Promise<ApiKey | null> => {
      try {
        const { data } = await apiClient.get<ApiKeyEnvelope>(
          `/api/tenants/${tenantId}/api-keys`
        );
        return unwrapApiData(data) ?? null;
      } catch (err: unknown) {
        // 404 means no key exists yet — treat as empty, not an error
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status === 404
        ) {
          return null;
        }
        throw err;
      }
    },
    enabled:
      !!tenantId && tenantId !== "undefined" && tenantId !== "null"
  });

/**
 * POST /api/tenants/:tenantId/api-keys
 * Creates a new API key. The plain key is returned once in the response.
 */
export const useGenerateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tenantId,
      dto
    }: GenerateApiKeyParams): Promise<ApiKey> => {
      const { data } = await apiClient.post<ApiKeyEnvelope>(
        `/api/tenants/${tenantId}/api-keys`,
        dto
      );
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.tenantId]
      });
    }
  });
};

/**
 * DELETE /api/tenants/:tenantId/api-keys/:id
 * Revokes the active API key.
 */
export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tenantId,
      apiKeyId
    }: RevokeApiKeyParams): Promise<void> => {
      await apiClient.delete(
        `/api/tenants/${tenantId}/api-keys/${apiKeyId}`
      );
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.tenantId]
      });
    }
  });
};
