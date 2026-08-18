import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import { Button } from "@gridcore/ui/components/ui/button";
import Field from "@gridcore/ui/components/Field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@gridcore/ui/components/ui/sheet";
import { Label } from "@gridcore/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@gridcore/ui/components/ui/radio-group";

import { createCustomer } from "../api";

interface NewCustomerFields {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  displayName: string;
}

/**
 * One form, one path (D-064): the person/offline split is a field variation,
 * not two flows, so there is one drawer and the toggle swaps its fields.
 * "Offline" means the merchant vends for them by hand and reaches them outside
 * the platform — no person, no login, just their name.
 *
 * A drawer rather than a modal: the form grows (site filing, more fields will
 * come) and a drawer scrolls naturally where a modal starts clipping.
 */
export default function NewCustomerSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [offline, setOffline] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<NewCustomerFields>({ mode: "onSubmit" });

  const close = (next: boolean) => {
    if (!next) {
      reset();
      setOffline(false);
    }
    onOpenChange(next);
  };

  const create = useMutation({
    mutationFn: (fields: NewCustomerFields) =>
      createCustomer(
        offline
          ? { displayName: fields.displayName }
          : {
              firstName: fields.firstName,
              lastName: fields.lastName,
              phone: fields.phone,
              email: fields.email,
            },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
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
          "displayName",
        ])
      ) {
        setError("root.serverError", {
          type: problem.code,
          message: toastMessage(problem),
        });
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>New customer</SheetTitle>
          <SheetDescription>
            {offline
              ? "Someone you vend for by hand and reach outside the platform. They cannot sign in — you are their record."
              : "Their phone becomes how they sign in to your portal."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit((fields) => create.mutate(fields))}
          noValidate
          className="flex flex-1 flex-col gap-4 px-6 py-5"
        >
          <RadioGroup
            value={offline ? "offline" : "person"}
            onValueChange={(value) => setOffline(value === "offline")}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="person" id="new-customer-person" />
              <Label htmlFor="new-customer-person">Has a phone</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="offline" id="new-customer-offline" />
              <Label htmlFor="new-customer-offline">Vended for offline</Label>
            </div>
          </RadioGroup>

          {errors.root?.serverError?.message ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.serverError.message}
            </p>
          ) : null}

          {offline ? (
            <Field
              label="Name you know them by"
              error={errors.displayName?.message}
              {...register("displayName", { required: "Give the name you know them by" })}
            />
          ) : (
            <>
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
            </>
          )}

          <div className="mt-auto flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Adding…" : "Add customer"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
