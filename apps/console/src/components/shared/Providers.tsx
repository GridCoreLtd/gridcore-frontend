
import { useState } from "react";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "jotai";
import { toast, Toaster } from "sonner";

import { parseApiError, toastMessage } from "@gridcore/api-client";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        /*
         * Reads only. A failed GET is never about a form field — there is no
         * input to attach it to — so a toast is the right surface, and this is
         * the one place it belongs.
         *
         * MUTATIONS are deliberately NOT handled here: each one reports its own
         * errors through parseApiError/applyFieldErrors so a rejected value
         * lands under the input that caused it. Adding a global mutation
         * handler would put a second, vaguer message on screen alongside it.
         */
        queryCache: new QueryCache({
          onError: (error) => {
            const problem = parseApiError(error);
            // 401 is already handled by the axios interceptor (session expiry
            // redirects to login); don't also shout about it.
            if (problem.status === 401) return;
            toast.error(toastMessage(problem));
          },
        }),
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      })
  );

  return (
    <div>
      <Provider>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        </QueryClientProvider>
      </Provider>
      <Toaster position="top-right" />
    </div>
  );
}
