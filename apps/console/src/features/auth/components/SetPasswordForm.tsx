import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { object, ref, string } from "yup";
import type { ObjectSchema } from "yup";

import {
  applyFieldErrors,
  parseApiError,
  toastMessage,
} from "@gridcore/api-client";
import Button from "@gridcore/ui/components/Button";
import Field from "@gridcore/ui/components/Field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from "@gridcore/ui/components/ui/input-otp";

import { requestPasswordOtp, setPassword } from "@/auth/password";
import AuthShell from "./AuthShell";
import FormError from "./FormError";

interface SetPasswordFields {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

// Mirrors the server's policy. The server is what enforces it — this only saves
// a round trip, and must never be the only place it is stated.
const schema: ObjectSchema<SetPasswordFields> = object({
  code: string()
    .matches(/^\d{6}$/, "Enter the six-digit code")
    .required("Enter the six-digit code"),
  newPassword: string()
    .min(8, "At least 8 characters")
    .matches(/[A-Z]/, "Include an uppercase letter")
    .matches(/\d/, "Include a digit")
    .matches(/[^A-Za-z0-9]/, "Include a special character")
    .required("Choose a new password"),
  confirmPassword: string()
    .oneOf([ref("newPassword")], "Both passwords must match")
    .required("Repeat the new password"),
});

const RESEND_DELAY_S = 60;

export default function SetPasswordForm() {
  const navigate = useNavigate();
  const [challengeId, setChallengeId] = useState<string>();
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SetPasswordFields>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { code: "" },
  });

  const sendCode = useMutation({
    mutationFn: requestPasswordOtp,
    onSuccess: (data) => {
      setChallengeId(data.challengeId);
      setSecondsLeft(RESEND_DELAY_S);
    },
    onError: (err) =>
      setError("root.serverError", {
        type: "server",
        message: toastMessage(parseApiError(err)),
      }),
  });

  const save = useMutation({
    mutationFn: (fields: SetPasswordFields) =>
      setPassword({
        challengeId: challengeId ?? "",
        code: fields.code,
        newPassword: fields.newPassword,
      }),
    // Every session for this person ends here, including this one — so there is
    // nothing to route to but the login screen, with the new password.
    onSuccess: () => navigate("/", { replace: true }),
    onError(err) {
      const problem = parseApiError(err);
      if (applyFieldErrors(problem, setError, ["code", "newPassword"])) {
        setError("root.serverError", {
          type: problem.code,
          message: toastMessage(problem),
        });
      }
    },
  });

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="This password must be replaced before you can continue."
    >
      <form
        onSubmit={handleSubmit((fields) => save.mutate(fields))}
        noValidate
        className="flex flex-col gap-5"
      >
        <FormError message={errors.root?.serverError?.message} />

        {!challengeId ? (
          <>
            <p className="text-sm text-muted-foreground">
              We will send a six-digit code to your phone to confirm it is you.
            </p>
            <Button
              type="button"
              text="Send code"
              width="100%"
              size="xl"
              isLoading={sendCode.isLoading}
              onClick={() => sendCode.mutate()}
            />
          </>
        ) : (
          <>
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
                    aria-describedby={
                      errors.code ? "password-code-error" : undefined
                    }
                    disabled={save.isLoading}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
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
                <p id="password-code-error" className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {secondsLeft > 0 ? (
                  <>You can resend the code in {secondsLeft}s</>
                ) : (
                  <>
                    Didn&apos;t get it?{" "}
                    <button
                      type="button"
                      disabled={sendCode.isLoading}
                      onClick={() => sendCode.mutate()}
                      className="font-medium text-primary disabled:opacity-60"
                    >
                      Resend code
                    </button>
                  </>
                )}
              </p>
            </div>
            <Field
              label="New password"
              placeholder="Choose a new password"
              type="password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <Field
              label="Repeat new password"
              placeholder="Repeat the new password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Button
              type="submit"
              text="Set password"
              width="100%"
              size="xl"
              isLoading={save.isLoading}
            />
          </>
        )}
      </form>
    </AuthShell>
  );
}
