import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import Field from "@gridcore/ui/components/Field";
import { Button } from "@gridcore/ui/components/ui/button";
import { Label } from "@gridcore/ui/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@gridcore/ui/components/ui/sheet";

import { useScopes } from "@/auth/useScopes";
import { MerchantCombobox, type MerchantChoice } from "@/entities/merchant";
import type { Site } from "@/entities/site";

import { createSite, updateSite } from "../api";

interface SiteFields {
  name: string;
  address: string;
  tariffRate: string; // naira; minor units on submit
  tariffIndex: string;
}

/**
 * Create and edit share the drawer; edit never touches the tariff — that is
 * its own operation under its own permission (M9's blast radius).
 */
export default function SiteSheet({
  site,
  open,
  onOpenChange,
}: {
  /** null creates; a site edits its name and address. */
  site: Site | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isPlatform } = useScopes();
  const [merchant, setMerchant] = useState<MerchantChoice | null>(null);
  const queryClient = useQueryClient();
  const editing = site !== null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<SiteFields>({ mode: "onSubmit" });

  useEffect(() => {
    if (open) {
      reset(
        site
          ? { name: site.name, address: site.address }
          : { name: "", address: "", tariffRate: "", tariffIndex: "" },
      );
    }
  }, [open, site, reset]);

  const close = (next: boolean) => {
    if (!next) {
      reset();
      setMerchant(null);
    }
    onOpenChange(next);
  };

  const save = useMutation({
    mutationFn: async (fields: SiteFields) => {
      if (editing) {
        await updateSite(site.id, { name: fields.name, address: fields.address });
        return;
      }
      const body: Parameters<typeof createSite>[0] = {
        name: fields.name,
        address: fields.address,
        tariffRateMinor: Math.round(Number(fields.tariffRate || 0) * 100),
      };
      if (fields.tariffIndex) body.tariffIndex = Number(fields.tariffIndex);
      if (isPlatform && merchant) body.merchantId = merchant.id;
      await createSite(body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sites"] });
      close(false);
    },
    onError(err) {
      const problem = parseApiError(err);
      if (
        applyFieldErrors(problem, setError, [
          "name",
          "address",
          "tariffRateMinor",
          "tariffIndex",
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
          <SheetTitle>{editing ? "Edit site" : "New site"}</SheetTitle>
          <SheetDescription>
            {editing
              ? "Name and address. The tariff has its own control — revising it moves every meter on the default."
              : "A place you vend at. New meters can fall back to its default rate."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit((fields) => save.mutate(fields))}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
            {isPlatform && !editing ? (
              <div className="flex flex-col gap-2">
                <Label>Merchant</Label>
                <MerchantCombobox value={merchant} onChange={setMerchant} />
              </div>
            ) : null}

            {errors.root?.serverError?.message ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.root.serverError.message}
              </p>
            ) : null}

            <Field
              label="Name"
              error={errors.name?.message}
              {...register("name", { required: "A site needs a name" })}
            />
            <Field
              label="Address"
              error={errors.address?.message}
              {...register("address", { required: "A site needs an address" })}
            />

            {!editing ? (
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Default rate (₦)"
                  type="number"
                  step="0.01"
                  min="0"
                  error={errors.tariffRate?.message}
                  {...register("tariffRate", { required: "The default price per unit" })}
                />
                <Field
                  label="Tariff index (optional)"
                  type="number"
                  min={1}
                  max={99}
                  error={errors.tariffIndex?.message}
                  {...register("tariffIndex")}
                />
              </div>
            ) : null}
          </div>

          <SheetFooter className="shrink-0 flex-row justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : editing ? "Save changes" : "Add site"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
