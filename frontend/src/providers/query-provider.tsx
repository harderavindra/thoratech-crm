import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";

import type { ReactNode } from "react";
import { toast } from "../components/ui/toast";

const extractMessage = (error: unknown) =>
  (error as any)?.response?.data?.message ?? "Something went wrong";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only toast on background refetch failures; initial loads show their own empty/error states
      if (query.state.data !== undefined) {
        toast.error(extractMessage(error));
      }
    },
  }),
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

export const QueryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};