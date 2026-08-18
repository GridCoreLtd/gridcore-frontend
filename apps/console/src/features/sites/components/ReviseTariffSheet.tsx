import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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

import type { Site } from "@/entities/site";

import { reviseSiteTariff } from "../api";

interface TariffFields {
  tariffRate: string;
  tariffIndex: string;
}

/** M9's consequence is the copy: meters ON the default follow, custom ones never. */
export default function ReviseTariffSheet({
  site,
  open,
  onOpenChange,
}: {
  site: Site | null;
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
  } = useForm<TariffFields>({ mode: "onSubmit" });

  useEffect(() => {
    if (open && site) {
      reset({
        tariffRate: (site.tariffRateMinor / 100).toString(),
        tariffIndex: site.tariffIndex ? String(site.tariffIndex) : "",
      });
    }
  }, [open, site, reset]);

  const revise = useMutation({
    mutationFn: (fields: TariffFields) =>
      reviseSiteTariff(site?.id ?? "", {
        tariffRateMinor: Math.round(Number(fields.tariffRate || 0) * 100),
        tariffIndex: fields.tariffIndex ? Number(fields.tariffIndex) : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sites"] });
      onOpenChange(false);
    },
    onError(err) {
      const problem = parseApiError(err);
      if (applyFieldErrors(problem, setError, ["tariffRateMinor", "tariffIndex"])) {
        setError("root.serverError", { type: problem.code, message: toastMessage(problem) });
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b px-6 py-5 text-left">
          <SheetTitle>Revise tariff — {site?.name}</SheetTitle>
          <SheetDescription>
            Every meter still on this site&apos;s default follows the new rate. Meters
            with their own price never move, and past vends keep the rate they used.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit((fields) => revise.mutate(fields))}
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
          </div>

          <SheetFooter className="shrink-0 flex-row justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={revise.isPending}>
              {revise.isPending ? "Revising…" : "Revise tariff"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
