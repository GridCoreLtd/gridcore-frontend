import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import Field from "@gridcore/ui/components/Field";
import { Button } from "@gridcore/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@gridcore/ui/components/ui/sheet";

import { attachPerson } from "../api";

interface AttachPersonFields {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

/**
 * The offline customer's upgrade (D-064): same edge, same meters, same
 * history — now with a person who can claim a portal login. A contact that
 * already belongs to someone is refused without saying whose (D-013).
 */
export default function AttachPersonSheet({
  customerId,
  customerName,
  open,
  onOpenChange,
}: {
  customerId: string;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<AttachPersonFields>({ mode: "onSubmit" });

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const attach = useMutation({
    mutationFn: (fields: AttachPersonFields) => attachPerson(customerId, fields),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      close(false);
    },
    onError(err) {
      const problem = parseApiError(err);
      if (applyFieldErrors(problem, setError, ["firstName", "lastName", "phone", "email"])) {
        setError("root.serverError", {
          type: problem.code,
          message: toastMessage(problem),
        });
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b px-6 py-5 text-left">
          <SheetTitle>Add contact details</SheetTitle>
          <SheetDescription>
            {customerName} keeps their meters and history. The phone becomes how they sign
            in — they get a one-time link to set their password.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit((fields) => attach.mutate(fields))}
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
          </div>

          <SheetFooter className="shrink-0 flex-row justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={attach.isPending}>
              {attach.isPending ? "Attaching…" : "Add details"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
