import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { useState } from "react";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import { Skeleton } from "@gridcore/ui/components/ui/skeleton";

import { adoptMerchant, listSessionMerchants } from "../api";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import AuthShell from "./AuthShell";
import FormError from "./FormError";

/**
 * One screen for both jobs, because it is one endpoint for both: adopting at
 * login and switching later are the same call, and the second is the first
 * repeated.
 *
 * The choices come from the server. A merchant this person holds no membership
 * at answers exactly as an unknown one does, so there is nothing to gain by
 * naming one that was not offered.
 */
export default function MerchantPicker() {
  const redirectAfterAuth = useAuthRedirect();
  const [failure, setFailure] = useState<string>();

  const { data: choices, isLoading } = useQuery({
    queryKey: ["session", "merchants"],
    queryFn: listSessionMerchants,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: adoptMerchant,
    // The cookie is rotated and the permissions re-resolved, so every cached
    // read belongs to the merchant just left. `useAuthRedirect` clears them.
    onSuccess: redirectAfterAuth,
    onError: (err) => setFailure(toastMessage(parseApiError(err))),
  });

  if (isLoading)
    return (
      <AuthShell
        title="Choose a merchant"
        subtitle="This account acts for more than one. Pick the one you are working on."
      >
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-md border border-border px-4 py-3"
            >
              <Skeleton className="size-5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </AuthShell>
    );

  return (
    <AuthShell
      title="Choose a merchant"
      subtitle="This account acts for more than one. Pick the one you are working on."
    >
      <div className="flex flex-col gap-3">
        <FormError message={failure} />

        {choices?.map((choice) => (
          <button
            key={choice.merchantId || "platform"}
            type="button"
            disabled={mutation.isLoading}
            onClick={() => {
              setFailure(undefined);
              mutation.mutate(choice.merchantId);
            }}
            className="flex items-center gap-3 rounded-md border border-border px-4 py-3 text-left hover:border-primary disabled:opacity-60"
          >
            <Building2 className="size-5 shrink-0 text-primary" aria-hidden />
            <span className="flex flex-col">
              {/* A platform membership carries no merchant, so it has no name
                  to show. The empty id is the platform, not a blank row. */}
              <span className="text-sm font-medium">
                {choice.merchantId ? choice.name : "GridCore platform"}
              </span>
              <span className="text-xs text-accent">{choice.role}</span>
            </span>
          </button>
        ))}

        {choices?.length === 0 && (
          <p className="text-sm text-accent">
            This account acts for no merchant. Ask an administrator for access.
          </p>
        )}
      </div>
    </AuthShell>
  );
}
