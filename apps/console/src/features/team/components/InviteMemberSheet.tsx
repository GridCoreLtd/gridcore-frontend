import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import Field from "@gridcore/ui/components/Field";
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

import { inviteTeamMember, listAssignableRoles } from "../api";

interface InviteFields {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roleId: string;
}

/**
 * The invite (blueprint 49): the member gets a one-time set-password link by
 * SMS — never a password. The role picker is fed by the server (D-043: no
 * role name hardcoded client-side). `merchantId` set means a platform session
 * is inviting into that merchant; unset on platform grants a platform role.
 */
export default function InviteMemberSheet({
  merchantId,
  open,
  onOpenChange,
}: {
  merchantId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const roles = useQuery({
    queryKey: ["roles", { merchantId }],
    queryFn: () => listAssignableRoles({ merchantId }),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    reset,
  } = useForm<InviteFields>({ mode: "onSubmit" });

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const invite = useMutation({
    mutationFn: (fields: InviteFields) =>
      inviteTeamMember({
        merchantId: merchantId || undefined,
        firstName: fields.firstName,
        lastName: fields.lastName,
        phone: fields.phone,
        email: fields.email,
        roleId: fields.roleId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["team"] });
      close(false);
    },
    onError(err) {
      const problem = parseApiError(err);
      if (
        applyFieldErrors(problem, setError, [
          "firstName",
          "lastName",
          "phone",
          "email",
          "roleId",
          "merchantId",
        ])
      ) {
        setError("root.serverError", { type: problem.code, message: toastMessage(problem) });
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b px-6 py-5 text-left">
          <SheetTitle>Invite a team member</SheetTitle>
          <SheetDescription>
            They get a one-time link by SMS to set their own password — never a password in
            a message. Their phone becomes how they sign in.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit((fields) => invite.mutate(fields))}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
            {errors.root?.serverError?.message ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.root.serverError.message}
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First name"
                error={errors.firstName?.message}
                {...register("firstName", { required: "First name" })}
              />
              <Field
                label="Last name"
                error={errors.lastName?.message}
                {...register("lastName", { required: "Last name" })}
              />
            </div>
            <Field
              label="Phone"
              type="tel"
              placeholder="+2348030000000"
              error={errors.phone?.message}
              {...register("phone", { required: "Their phone, international format" })}
            />
            <Field
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register("email", { required: "An email is required" })}
            />
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Select
                value={watch("roleId") ?? ""}
                onValueChange={(value) => setValue("roleId", value, { shouldValidate: true })}
              >
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
              <input type="hidden" {...register("roleId", { required: "Choose a role" })} />
              {errors.roleId?.message ? (
                <p className="text-xs text-destructive">{errors.roleId.message}</p>
              ) : null}
            </div>
          </div>

          <SheetFooter className="shrink-0 flex-row justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? "Inviting…" : "Send invite"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
