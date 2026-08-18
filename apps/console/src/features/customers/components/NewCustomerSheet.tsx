import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import Field from "@gridcore/ui/components/Field";
import { Button } from "@gridcore/ui/components/ui/button";
import { Checkbox } from "@gridcore/ui/components/ui/checkbox";
import { Label } from "@gridcore/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@gridcore/ui/components/ui/radio-group";
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
  SheetHeader,
  SheetTitle,
} from "@gridcore/ui/components/ui/sheet";

import { useScopes } from "@/auth/useScopes";
import { MerchantCombobox, type MerchantChoice } from "@/entities/merchant";

import { createCustomer } from "../api";

interface NewCustomerFields {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  displayName: string;
  meter: {
    meterNumber: string;
    commodity: string;
    comms: string;
    tariffIndex: string;
    tariffRate: string; // naira; converted to minor units on submit
  };
}

const COMMODITIES = ["ELECTRICITY", "WATER", "GAS", "TIME"] as const;
const COMMS = ["GSM", "LORA", "CALIN", "NONE"] as const;

/**
 * One form, one path (D-064 + blueprint 44): the person/offline split is a
 * field variation, the meter is an optional section of the SAME submit, and
 * everything lands in one transaction server-side. A platform session names
 * the merchant; a merchant's own is implied.
 */
export default function NewCustomerSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isPlatform } = useScopes();
  const [offline, setOffline] = useState(false);
  const [withMeter, setWithMeter] = useState(false);
  const [merchant, setMerchant] = useState<MerchantChoice | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
    watch,
  } = useForm<NewCustomerFields>({
    mode: "onSubmit",
    defaultValues: {
      meter: { commodity: "ELECTRICITY", comms: "GSM", tariffIndex: "3" },
    } as Partial<NewCustomerFields>,
  });

  const close = (next: boolean) => {
    if (!next) {
      reset();
      setOffline(false);
      setWithMeter(false);
      setMerchant(null);
    }
    onOpenChange(next);
  };

  const create = useMutation({
    mutationFn: (fields: NewCustomerFields) => {
      const body: Parameters<typeof createCustomer>[0] = offline
        ? { displayName: fields.displayName }
        : {
            firstName: fields.firstName,
            lastName: fields.lastName,
            phone: fields.phone,
            email: fields.email,
          };
      if (isPlatform && merchant) body.merchantId = merchant.id;
      if (withMeter) {
        body.meter = {
          meterNumber: fields.meter.meterNumber,
          commodity: fields.meter.commodity,
          comms: fields.meter.comms,
          tariffIndex: Number(fields.meter.tariffIndex),
          // The operator types naira; the API speaks minor units.
          tariffRateMinor: Math.round(Number(fields.meter.tariffRate) * 100),
        };
      }
      return createCustomer(body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      void queryClient.invalidateQueries({ queryKey: ["meters"] });
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
          "merchantId",
          "meter.meterNumber",
          "meter.commodity",
          "meter.comms",
          "meter.tariffIndex",
          "meter.tariffRateMinor",
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
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>New customer</SheetTitle>
          <SheetDescription>
            {offline
              ? "Someone you vend for by hand and reach outside the platform. They cannot sign in — you are their record."
              : "Their phone becomes how they sign in — they get a one-time link to set their password."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit((fields) => create.mutate(fields))}
          noValidate
          className="flex flex-1 flex-col gap-4 px-6 py-5"
        >
          {isPlatform ? (
            <div className="flex flex-col gap-2">
              <Label>Merchant</Label>
              <MerchantCombobox value={merchant} onChange={setMerchant} />
              {errors.root?.serverError?.type === "merchant_required" ? (
                <p className="text-sm text-destructive">Name the merchant</p>
              ) : null}
            </div>
          ) : null}

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

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="new-customer-meter"
              checked={withMeter}
              onCheckedChange={(checked) => setWithMeter(checked === true)}
            />
            <Label htmlFor="new-customer-meter">Register their meter now</Label>
          </div>

          {withMeter ? (
            <div className="flex flex-col gap-4 rounded-md border bg-primary/[0.03] p-4">
              <Field
                label="Meter number"
                error={errors.meter?.meterNumber?.message}
                {...register("meter.meterNumber", { required: "As printed on the meter" })}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Commodity</Label>
                  <Select
                    value={watch("meter.commodity")}
                    onValueChange={(value) => setValue("meter.commodity", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMODITIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c.charAt(0) + c.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Comms</Label>
                  <Select
                    value={watch("meter.comms")}
                    onValueChange={(value) => setValue("meter.comms", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Tariff index"
                  type="number"
                  min={1}
                  max={99}
                  error={errors.meter?.tariffIndex?.message}
                  {...register("meter.tariffIndex", { required: "1-99" })}
                />
                <Field
                  label="Rate per unit (₦)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  error={errors.meter?.tariffRate?.message}
                  {...register("meter.tariffRate", { required: "The price per unit" })}
                />
              </div>
            </div>
          ) : null}

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
