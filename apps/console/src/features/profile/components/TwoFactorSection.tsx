import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareText, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

import { parseApiError, toastMessage } from "@gridcore/api-client";
import Button from "@gridcore/ui/components/Button";
import { Badge } from "@gridcore/ui/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@gridcore/ui/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from "@gridcore/ui/components/ui/input-otp";
import { Skeleton } from "@gridcore/ui/components/ui/skeleton";

import {
  activateTotpEnrolment,
  beginTotpEnrolment,
  getMfaSettings,
  setPrimaryFactor,
} from "../api";
import type { TotpEnrolment } from "../types";

const mfaKey = ["mfa"];

function FactorRowSkeleton() {
  return (
    <li className="flex items-center gap-4 py-4">
      <Skeleton className="size-5 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-9 w-24" />
    </li>
  );
}

export default function TwoFactorSection() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: mfaKey,
    queryFn: getMfaSettings,
  });

  const sms = data?.factors.find((f) => f.type === "SMS" && f.status === "ACTIVE");
  const totp = data?.factors.find((f) => f.type === "TOTP" && f.status === "ACTIVE");

  const switchPrimary = useMutation({
    mutationFn: setPrimaryFactor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mfaKey }),
    onError: (err) => toast.error(toastMessage(parseApiError(err))),
  });

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary/25 text-secondary-foreground"
        >
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Two-factor authentication
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Every sign-in asks for a code from your primary method.
          </p>
        </div>
      </div>

      {isLoading ? (
        <ul className="mt-4 divide-y divide-border">
          <FactorRowSkeleton />
          <FactorRowSkeleton />
        </ul>
      ) : isError || !data ? (
        <p className="mt-4 text-sm text-destructive">
          Your sign-in methods could not be loaded. Refresh to try again.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {sms && (
            <li className="flex items-center gap-4 py-4">
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-foreground/70"
              >
                <MessageSquareText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Text message</p>
                <p className="text-sm text-muted-foreground">{data.phone}</p>
              </div>
              {sms.isPrimary ? (
                <Badge variant="secondary">Primary</Badge>
              ) : (
                <Button
                  text="Make primary"
                  variant="neutral"
                  isLoading={switchPrimary.isLoading}
                  onClick={() => switchPrimary.mutate("SMS")}
                />
              )}
            </li>
          )}

          <li className="flex items-center gap-4 py-4">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-foreground/70"
            >
              <Smartphone className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Authenticator app</p>
              <p className="text-sm text-muted-foreground">
                {totp
                  ? "Codes from your device, no signal needed"
                  : "Google Authenticator, Authy, 1Password…"}
              </p>
            </div>
            {totp?.isPrimary && <Badge variant="secondary">Primary</Badge>}
            {totp && !totp.isPrimary && (
              <>
                <Badge variant="muted">Active</Badge>
                <Button
                  text="Make primary"
                  variant="neutral"
                  isLoading={switchPrimary.isLoading}
                  onClick={() => switchPrimary.mutate("TOTP")}
                />
              </>
            )}
            <EnrolAuthenticatorDialog
              replacing={Boolean(totp)}
              onEnrolled={() => queryClient.invalidateQueries({ queryKey: mfaKey })}
            />
          </li>
        </ul>
      )}
    </section>
  );
}

function EnrolAuthenticatorDialog({
  replacing,
  onEnrolled,
}: {
  replacing: boolean;
  onEnrolled: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [enrolment, setEnrolment] = useState<TotpEnrolment>();
  const [code, setCode] = useState("");
  const [failure, setFailure] = useState<string>();

  const begin = useMutation({
    mutationFn: beginTotpEnrolment,
    onSuccess: setEnrolment,
    onError: (err) => {
      setOpen(false);
      toast.error(toastMessage(parseApiError(err)));
    },
  });

  const activate = useMutation({
    mutationFn: activateTotpEnrolment,
    onSuccess: () => {
      setOpen(false);
      toast.success("Authenticator enrolled. It is now your primary method.");
      onEnrolled();
    },
    onError: (err) => {
      setCode("");
      setFailure(toastMessage(parseApiError(err)));
    },
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    setEnrolment(undefined);
    setCode("");
    setFailure(undefined);
    // The secret is minted when the dialog opens, so what the QR shows is
    // exactly what activation will verify against.
    if (next) begin.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button
        text={replacing ? "Replace" : "Set up"}
        variant={replacing ? "neutral" : "default"}
        onClick={() => onOpenChange(true)}
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set up an authenticator</DialogTitle>
          <DialogDescription>
            Scan the code with your authenticator app, or type the secret in by
            hand, then enter the six-digit code it shows.
            {replacing && " Your current authenticator keeps working until this one is confirmed."}
          </DialogDescription>
        </DialogHeader>

        {!enrolment ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="size-48 rounded-xl" />
            <Skeleton className="h-8 w-56" />
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((slot) => (
                <Skeleton key={slot} className="size-11" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-xl border border-border bg-white p-3">
              <QRCodeSVG value={enrolment.otpauthUrl} size={168} aria-label="Enrolment QR code" />
            </div>
            <p className="max-w-full break-all rounded-md bg-muted px-3 py-2 text-center font-mono text-xs text-muted-foreground">
              {enrolment.secret}
            </p>

            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              autoFocus
              aria-label="Code from the authenticator"
              aria-invalid={Boolean(failure)}
              disabled={activate.isLoading}
              value={code}
              onChange={(next) => {
                setCode(next);
                setFailure(undefined);
              }}
              // The sixth digit is the whole form, so entering it submits.
              onComplete={(complete: string) => activate.mutate(complete)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {failure && <p className="text-sm text-destructive">{failure}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
