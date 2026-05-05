import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
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
