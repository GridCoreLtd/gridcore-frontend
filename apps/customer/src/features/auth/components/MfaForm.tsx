import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { object, string } from "yup";
import type { ObjectSchema } from "yup";

import {
  applyFieldErrors,
  parseApiError,
  toastMessage,
} from "@gridcore/api-client";
import Button from "@gridcore/ui/components/Button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from "@gridcore/ui/components/ui/input-otp";

import { resendMfaOtp, verifyMfa } from "../api";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import type { MfaFields } from "../types";
import { useBranding } from "../useBranding";
import AuthShell from "./AuthShell";
import FormError from "./FormError";

const schema: ObjectSchema<MfaFields> = object({
  code: string()
    .matches(/^\d{6}$/, "Enter the six-digit code")
    .required("Enter the six-digit code"),
});

// Mirrors the server's MFA_RESEND_INTERVAL; the server enforces it either way.
const RESEND_DELAY_S = 60;

/** Reached only by a customer who opted into a second factor (D-017). */
export default function MfaForm() {
  const navigate = useNavigate();
  const redirectAfterAuth = useAuthRedirect();
  const { branding } = useBranding();
  const { state } = useLocation();
  const handoff = state as { challengeId: string; factorType?: string } | null;

  const isSms = handoff?.factorType !== "TOTP";
  const [secondsLeft, setSecondsLeft] = useState(RESEND_DELAY_S);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<MfaFields>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { code: "" },
  });

  const mutation = useMutation({
    mutationFn: (fields: MfaFields) =>
      verifyMfa({ challengeId: handoff?.challengeId ?? "", code: fields.code }),
    onSuccess: redirectAfterAuth,
    onError(err) {
      const problem = parseApiError(err);
      if (applyFieldErrors(problem, setError, ["code"])) {
        setError("root.serverError", {
          type: problem.code,
          message: toastMessage(problem),
        });
      }
    },
  });

  const submit = handleSubmit((fields) => mutation.mutate(fields));

  const resend = useMutation({
    mutationFn: () => resendMfaOtp(handoff?.challengeId ?? ""),
    onSuccess: () => setSecondsLeft(RESEND_DELAY_S),
    onError: (err) =>
      setError("root.serverError", {
        type: "server",
        message: toastMessage(parseApiError(err)),
      }),
  });

  // Reached directly, or reloaded: the challenge lives in router state and does
  // not survive either, and it cannot be re-issued without the password.
  if (!handoff?.challengeId) return <Navigate to="/" replace />;

  const destination =
    handoff.factorType === "TOTP"
      ? "Enter the code from your authenticator app"
      : "We sent a six-digit code to your phone";

  return (
    <AuthShell branding={branding} title="One more step" subtitle={destination}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <FormError message={errors.root?.serverError?.message} />

        <div className="flex flex-col items-center gap-2">
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                autoFocus
                autoComplete="one-time-code"
                aria-label="Verification code"
                aria-invalid={Boolean(errors.code)}
                aria-describedby={errors.code ? "mfa-code-error" : undefined}
                disabled={mutation.isLoading}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onComplete={submit}
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
            )}
          />
          {errors.code?.message && (
            <p id="mfa-code-error" className="text-sm text-destructive">
              {errors.code.message}
            </p>
          )}
          {isSms && (
            <p className="text-sm text-muted-foreground">
              {secondsLeft > 0 ? (
                <>You can resend the code in {secondsLeft}s</>
              ) : (
                <>
                  Didn&apos;t get it?{" "}
                  <button
                    type="button"
                    disabled={resend.isLoading}
                    onClick={() => resend.mutate()}
                    className="font-medium text-primary disabled:opacity-60"
                  >
                    Resend code
                  </button>
                </>
              )}
            </p>
          )}
        </div>

        <Button
          type="submit"
          text="Verify"
          width="100%"
          size="xl"
          isLoading={mutation.isLoading}
        />

        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="text-sm font-medium text-primary"
        >
          Back to sign in
        </button>
      </form>
    </AuthShell>
  );
}
