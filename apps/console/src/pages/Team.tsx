import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import { toast } from "sonner";

import { DataTable } from "@gridcore/ui/components/data-table";
import { Badge } from "@gridcore/ui/components/ui/badge";
import { Button } from "@gridcore/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@gridcore/ui/components/ui/dropdown-menu";
import { usePermissions } from "@/auth/usePermissions";
import { useScopes } from "@/auth/useScopes";
import {
  ChangeRoleSheet,
  InviteMemberSheet,
  listTeam,
  revokeTeamMember,
  type TeamMember,
} from "@/features/team";
import { dateFormatter, initials } from "@/utils/formatters";

/**
 * The team (blueprint 49): each side manages its OWN team — a merchant its
 * members, platform its operators. Merchant teams are the merchants' business
 * (ruled 2026-08-18). The controls hide without membership.grant/revoke —
 * courtesy only, the server enforces.
 */
export default function Team() {
  const { scopes } = useScopes();
  const isPlatform = scopes.includes("platform");
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const [inviting, setInviting] = useState(false);
  const [changing, setChanging] = useState<TeamMember | null>(null);

  const query = useQuery({ queryKey: ["team"], queryFn: listTeam });

  const revoke = useMutation({
    mutationFn: (member: TeamMember) => revokeTeamMember(member.membershipId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["team"] }),
    // Nothing attaches to a field on a row action; the refusal toasts.
    onError: (err) => toast.error(toastMessage(parseApiError(err))),
  });

  const mayManage = can("membership.grant") || can("membership.revoke");

  const columns = useMemo<ColumnDef<TeamMember>[]>(() => {
    const base: ColumnDef<TeamMember>[] = [
      {
        id: "member",
        header: "Member",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-xs font-semibold text-primary"
            >
              {initials(`${row.original.firstName} ${row.original.lastName}`)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {row.original.firstName} {row.original.lastName}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {row.original.phone}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-sm">{row.original.email}</span>,
      },
      {
        accessorKey: "roleDisplayName",
        header: "Role",
        cell: ({ row }) => <Badge variant="secondary">{row.original.roleDisplayName}</Badge>,
      },
      {
        accessorKey: "grantedAt",
        header: "Granted",
        cell: ({ row }) => (
          <div className="text-sm">
            {dateFormatter.format(new Date(row.original.grantedAt))}
            {row.original.grantedBy ? (
              <p className="text-xs text-muted-foreground">by {row.original.grantedBy}</p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "accountStatus",
        header: "Status",
        cell: ({ row }) =>
          row.original.accountStatus === "LOCKED" ? (
            <Badge variant="destructive">Locked</Badge>
          ) : row.original.accountStatus === "DISABLED" ? (
            <Badge variant="destructive">Disabled</Badge>
          ) : (
            <Badge variant="muted">Active</Badge>
          ),
      },
    ];
    if (mayManage) {
      base.push({
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Member actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {can("membership.grant") ? (
                <DropdownMenuItem onSelect={() => setChanging(row.original)}>
                  Change role
                </DropdownMenuItem>
              ) : null}
              {can("membership.revoke") ? (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => revoke.mutate(row.original)}
                >
                  Revoke access
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      });
    }
    return base;
  }, [mayManage, can, revoke]);

  const rows = query.data?.data ?? [];

  return (
    <section className="flex flex-col gap-5">
      <div className="-mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isPlatform
            ? "The operators who run the platform."
            : "The people who operate this account with you."}
        </p>
        {can("membership.grant") ? (
          <Button size="sm" onClick={() => setInviting(true)}>
            <Plus className="size-4" />
            Invite member
          </Button>
        ) : null}
      </div>

      <InviteMemberSheet open={inviting} onOpenChange={setInviting} />
      <ChangeRoleSheet
        member={changing}
        open={changing !== null}
        onOpenChange={(next) => {
          if (!next) setChanging(null);
        }}
      />

      <DataTable columns={columns} data={rows} loading={query.isLoading} manual />
    </section>
  );
}
