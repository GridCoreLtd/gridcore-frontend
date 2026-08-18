import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import { Button } from "@gridcore/ui/components/ui/button";
import { Label } from "@gridcore/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gridcore/ui/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@gridcore/ui/components/ui/sheet";

import { changeTeamMemberRole, listAssignableRoles, type TeamMember } from "../api";

/**
 * Role change (blueprint 49 §5.3a): the last admin is refused server-side, and
 * the member's sessions rotate so the new permissions bind immediately.
 */
export default function ChangeRoleSheet({
  member,
  open,
  onOpenChange,
}: {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const roles = useQuery({
    queryKey: ["roles"],
    queryFn: listAssignableRoles,
    enabled: open,
  });

  useEffect(() => {
    if (open && member) {
      const current = roles.data?.data.find((r) => r.name === member.roleName);
      setRoleId(current?.id ?? "");
      setError(null);
    }
  }, [open, member, roles.data]);

  const change = useMutation({
    mutationFn: () => changeTeamMemberRole(member?.membershipId ?? "", roleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["team"] });
      onOpenChange(false);
    },
    onError: (err) => setError(toastMessage(parseApiError(err))),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b px-6 py-5 text-left">
          <SheetTitle>
            Change role — {member?.firstName} {member?.lastName}
          </SheetTitle>
          <SheetDescription>
            Their sessions rotate immediately, so the new permissions bind on their next
            request. Every team keeps at least one admin.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role…" />
              </SelectTrigger>
              <SelectContent>
                {(roles.data?.data ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-3 border-t px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => change.mutate()} disabled={change.isPending || !roleId}>
            {change.isPending ? "Changing…" : "Change role"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
