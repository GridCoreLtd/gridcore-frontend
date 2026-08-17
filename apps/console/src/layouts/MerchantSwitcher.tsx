import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@gridcore/ui/components/ui/dropdown-menu";

import { useSession } from "@/auth/useSession";
import {
  adoptMerchant,
  listSessionMerchants,
  useAuthRedirect,
} from "@/features/auth";

/**
 * The picker again, in the chrome — the same endpoint that adopted this
 * merchant at login, so switching here and switching there are one flow.
 */
export default function MerchantSwitcher() {
  const { session } = useSession();
  const redirectAfterAuth = useAuthRedirect();

  const canSwitch = (session?.membershipCount ?? 0) > 1;

  // A platform operator acts for no merchant, so there is no name to show and
  // "GridCore" would be a brand string in a product white-labelled per merchant.
  const context = session?.merchantName || "Platform";
  const role = session?.role?.replace(/_/g, " ");

  const { data: choices } = useQuery({
    queryKey: ["session", "merchants"],
    queryFn: listSessionMerchants,
    enabled: canSwitch,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: adoptMerchant,
    // The cookie is rotated and the permissions re-resolved, so every cached
    // read belongs to the merchant just left. `useAuthRedirect` clears them.
    onSuccess: redirectAfterAuth,
    onError: (err) => toast.error(toastMessage(parseApiError(err))),
  });

  const card = (
    <>
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
      >
        <Building2 className="size-[1.1rem]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="truncate text-sm font-medium text-foreground">
          {context}
        </span>
        {role && (
          <span className="truncate text-xs text-muted-foreground capitalize">
            {role}
          </span>
        )}
      </span>
    </>
  );

  if (!canSwitch) {
    return (
      <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/40 p-2.5">
        {card}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={mutation.isLoading}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/40 p-2.5 transition-colors hover:bg-muted focus:outline-hidden disabled:opacity-60"
      >
        {card}
        <ChevronsUpDown
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </DropdownMenuTrigger>

      {/* Pinned to the drawer's bottom edge, so the menu opens upward. */}
      <DropdownMenuContent side="top" align="start" className="w-60 py-2">
        <DropdownMenuLabel className="px-4 py-1 text-xs font-normal text-muted-foreground">
          Switch merchant
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {choices?.map((choice) => {
          const current =
            (choice.merchantId || "") === (session?.merchantId || "");
          return (
            <DropdownMenuItem
              key={choice.merchantId || "platform"}
              disabled={mutation.isLoading}
              onSelect={() => {
                if (!current) mutation.mutate(choice.merchantId);
              }}
              className="flex items-center gap-3 px-4 py-[0.65rem]"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                {/* A platform membership carries no merchant, so it has no name
                    to show. The empty id is the platform, not a blank row. */}
                <span className="truncate text-sm font-medium">
                  {choice.merchantId ? choice.name : "GridCore platform"}
                </span>
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {choice.role?.replace(/_/g, " ")}
                </span>
              </span>
              {current && (
                <Check className="size-4 shrink-0 text-primary" aria-hidden />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
