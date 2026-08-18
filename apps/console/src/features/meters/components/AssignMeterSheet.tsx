import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { parseApiError, toastMessage } from "@gridcore/api-client";
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

import { CustomerCombobox, type CustomerChoice } from "@/entities/customer";

import { assignMeter, reassignMeter } from "../api";

/**
 * Assign and reassign share the drawer; the mode changes the verb and the
 * warning, never the shape (blueprint 47). Reassign's copy names who loses
 * the meter — closing their span is the deliberate act.
 */
export default function AssignMeterSheet({
  meterId,
  meterNumber,
  currentHolder,
  open,
  onOpenChange,
}: {
  meterId: string;
  meterNumber: string;
  /** Null assigns; a name reassigns and is shown losing the meter. */
  currentHolder: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [customer, setCustomer] = useState<CustomerChoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const reassigning = currentHolder !== null;

  const close = (next: boolean) => {
    if (!next) {
      setCustomer(null);
      setError(null);
    }
    onOpenChange(next);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!customer) throw new Error("pick");
      if (reassigning) {
        await reassignMeter(meterId, customer.id);
        return;
      }
      await assignMeter(meterId, customer.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["meters"] });
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      close(false);
    },
    onError(err) {
      if (err instanceof Error && err.message === "pick") {
        setError("Choose the customer first.");
        return;
      }
      setError(toastMessage(parseApiError(err)));
    },
  });

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b px-6 py-5 text-left">
          <SheetTitle>
            {reassigning ? "Reassign" : "Assign"} meter {meterNumber}
          </SheetTitle>
          <SheetDescription>
            {reassigning
              ? `${currentHolder} holds this meter now — reassigning closes their custody and the new holder is notified.`
              : "The customer is notified and can buy credit for it right away."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label>Customer</Label>
            <CustomerCombobox value={customer} onChange={setCustomer} />
          </div>
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-3 border-t px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : reassigning ? "Reassign meter" : "Assign meter"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
