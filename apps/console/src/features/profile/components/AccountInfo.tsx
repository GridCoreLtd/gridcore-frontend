import { Badge } from "@gridcore/ui/components/ui/badge";

import { useSession } from "@/auth/useSession";

export default function AccountInfo() {
  const { session } = useSession();

  // A platform operator acts for no merchant, so there is no name to show and
  // "GridCore" would be a brand string in a product white-labelled per merchant.
  const context = session?.merchantName || "Platform";
  const role = session?.role?.replace(/_/g, " ");

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground"
        >
          {session?.firstName?.[0]}
          {session?.lastName?.[0]}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold tracking-tight text-foreground">
            {session?.firstName} {session?.lastName}
          </p>
          {role && (
            <p className="truncate text-sm text-muted-foreground capitalize">
              {role}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Acting for</span>
        <Badge variant="secondary">{context}</Badge>
      </div>
    </section>
  );
}
