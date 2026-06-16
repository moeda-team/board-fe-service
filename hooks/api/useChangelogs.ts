import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import type { Changelog, ChangelogListEnvelope } from "@/types/type-changelogs";

const QUERY_KEY = "changelogs";

export const changelogsQueryKey = () => [QUERY_KEY] as const;

/**
 * GET /api/changelogs
 * Public changelog list — no auth required.
 */
export const useChangelogs = (enabled = true) =>
  useQuery<Changelog[]>({
    queryKey: changelogsQueryKey(),
    queryFn: async () => {
      const { data } =
        await apiClient.get<ChangelogListEnvelope>("/api/changelogs");
      return unwrapApiData(data)?.items ?? [];
    },
    enabled
  });
