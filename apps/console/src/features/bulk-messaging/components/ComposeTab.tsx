import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import { toast } from "sonner";

import Field from "@gridcore/ui/components/Field";
import { TextArea } from "@gridcore/ui/components/FormField";
import { Button } from "@gridcore/ui/components/ui/button";
import { Checkbox } from "@gridcore/ui/components/ui/checkbox";
import { Label } from "@gridcore/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@gridcore/ui/components/ui/radio-group";

import { CustomerCombobox, type CustomerChoice } from "@/entities/customer";
import { MerchantCombobox, type MerchantChoice } from "@/entities/merchant";

import {
  previewBulkAudience,
  sendBulkMessage,
  type BulkAudience,
  type DeliveryChannel,
} from "../api";

const SMS_SEGMENT_LENGTH = 160;

/**
 * Compose (blueprint 50): SMS or email — the two radio cards ARE C6. The
 * audience unions "all" flags with explicit picks (legacy's overwrite bug is
 * dead), and nothing sends before the preview count is confirmed.
 */
export default function ComposeTab({ onSent }: { onSent: (id: string) => void }) {
  const [channel, setChannel] = useState<DeliveryChannel>("SMS");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [allCustomers, setAllCustomers] = useState(false);
  const [allMerchants, setAllMerchants] = useState(false);
  const [customers, setCustomers] = useState<CustomerChoice[]>([]);
  const [merchants, setMerchants] = useState<MerchantChoice[]>([]);
  const [preview, setPreview] = useState<number | null>(null);

  const audience: BulkAudience = {
    allCustomers: allCustomers || undefined,
    allMerchants: allMerchants || undefined,
    customerIds: allCustomers ? undefined : customers.map((c) => c.id),
    merchantIds: allMerchants ? undefined : merchants.map((m) => m.id),
  };
  const hasAudience =
    allCustomers || allMerchants || customers.length > 0 || merchants.length > 0;

  const previewMutation = useMutation({
    mutationFn: () => previewBulkAudience(audience),
    onSuccess: (result) => setPreview(result.recipientCount),
    onError: (err) => toast.error(toastMessage(parseApiError(err))),
  });

  const send = useMutation({
    mutationFn: () => sendBulkMessage({ channel, title, body, audience }),
    onSuccess: (result) => {
      toast.success(
        result.alreadySent
          ? "That campaign was already sent."
          : `Sending to ${result.recipientCount} recipients.`,
      );
      setPreview(null);
      setTitle("");
      setBody("");
      setCustomers([]);
      setMerchants([]);
      setAllCustomers(false);
      setAllMerchants(false);
      onSent(result.id);
    },
    onError: (err) => toast.error(toastMessage(parseApiError(err))),
  });

  const segments = channel === "SMS" ? Math.max(1, Math.ceil(body.length / SMS_SEGMENT_LENGTH)) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-4">
        <Field
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={500}
        />
        <TextArea
          label={channel === "SMS" ? "Message" : "Email body"}
          rows={6}
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            setPreview(null);
          }}
        />
        <p className="text-xs text-muted-foreground">
          {body.length} characters
          {channel === "SMS" ? ` · SMS: ${segments} message(s)` : null}
        </p>

        <div className="flex flex-col gap-3 rounded-md border bg-primary/[0.03] p-4">
          <p className="text-sm font-medium text-foreground">Audience</p>
          <div className="flex items-center gap-2">
            <Checkbox
              id="bulk-all-customers"
              checked={allCustomers}
              onCheckedChange={(next) => {
                setAllCustomers(next === true);
                setPreview(null);
              }}
            />
            <Label htmlFor="bulk-all-customers">All customers</Label>
          </div>
          {!allCustomers ? (
            <PickList
              label="Add a customer"
              picks={customers.map((c) => ({ id: c.id, name: c.name }))}
              onRemove={(pickID) => setCustomers(customers.filter((c) => c.id !== pickID))}
            >
              <CustomerCombobox
                value={null}
                onChange={(pick) => {
                  if (pick && !customers.some((c) => c.id === pick.id)) {
                    setCustomers([...customers, pick]);
                    setPreview(null);
                  }
                }}
              />
            </PickList>
          ) : null}
          <div className="flex items-center gap-2">
            <Checkbox
              id="bulk-all-merchants"
              checked={allMerchants}
              onCheckedChange={(next) => {
                setAllMerchants(next === true);
                setPreview(null);
              }}
            />
            <Label htmlFor="bulk-all-merchants">All merchants (every admin)</Label>
          </div>
          {!allMerchants ? (
            <PickList
              label="Add a merchant"
              picks={merchants.map((m) => ({ id: m.id, name: m.name }))}
              onRemove={(pickID) => setMerchants(merchants.filter((m) => m.id !== pickID))}
            >
              <MerchantCombobox
                value={null}
                onChange={(pick) => {
                  if (pick && !merchants.some((m) => m.id === pick.id)) {
                    setMerchants([...merchants, pick]);
                    setPreview(null);
                  }
                }}
              />
            </PickList>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-md border p-4">
          <p className="text-sm font-medium text-foreground">Delivery channel</p>
          <RadioGroup
            value={channel}
            onValueChange={(next) => setChannel(next as DeliveryChannel)}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="SMS" id="bulk-sms" />
              <Label htmlFor="bulk-sms">SMS</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="EMAIL" id="bulk-email" />
              <Label htmlFor="bulk-email">Email</Label>
            </div>
          </RadioGroup>
        </div>

        {/* The confirm step: nothing sends before the count is seen. */}
        {preview === null ? (
          <Button
            disabled={!hasAudience || !title || !body || previewMutation.isPending}
            onClick={() => previewMutation.mutate()}
          >
            {previewMutation.isPending ? "Counting…" : "Preview audience"}
          </Button>
        ) : (
          <div className="flex flex-col gap-3 rounded-md border border-secondary bg-secondary/10 p-4">
            <p className="text-sm text-foreground">
              This reaches <span className="font-semibold">{preview}</span> recipient
              {preview === 1 ? "" : "s"}
              {channel === "SMS" ? ` (${segments} SMS each)` : ""}.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setPreview(null)}>
                Back
              </Button>
              <Button disabled={send.isPending} onClick={() => send.mutate()}>
                {send.isPending ? "Sending…" : "Send campaign"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PickList({
  label,
  picks,
  onRemove,
  children,
}: {
  label: string;
  picks: { id: string; name: string }[];
  onRemove: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {picks.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {picks.map((pick) => (
            <button
              key={pick.id}
              type="button"
              onClick={() => onRemove(pick.id)}
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20"
            >
              {pick.name} ×
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
