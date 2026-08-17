
import { useState } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "jotai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { parseApiError, toastMessage } from "@gridcore/api-client";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        /*
         * Reads only. A failed GET is never about a form field, so a toast is
         * the right surface and this is the one place it belongs.
         *
         * MUTATIONS are deliberately NOT handled here: each reports its own
         * errors through parseApiError/applyFieldErrors so a rejected value
         * lands under the input that caused it.
         */
        queryCache: new QueryCache({
          onError: (error) => {
            const problem = parseApiError(error);
            // 401 already redirects to login via the axios interceptor.
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

      <ToastContainer autoClose={8000} bodyClassName="toast-body" />
    </div>
  );
}
