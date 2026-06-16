import { MutationCache, QueryClient } from "@tanstack/react-query";
import { gooeyToast } from "goey-toast";

export function makeQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        if (typeof window === "undefined") return;
        const message = mutation.meta?.successMessage as string | undefined;
        if (message) {
          gooeyToast.success(message);
        }
      },
      onError: (_error, _variables, _context, mutation) => {
        if (typeof window === "undefined") return;
        const message = mutation.meta?.errorMessage as string | undefined;
        if (message) {
          gooeyToast.error(message);
        }
      },
    }),
    defaultOptions: {
      queries: {
        // With SSR we usually want a staleTime > 0 to avoid
        // refetching immediately on the client after server render.
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  });
}
