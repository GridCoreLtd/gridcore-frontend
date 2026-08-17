import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Phone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { object, string } from "yup";
import type { ObjectSchema } from "yup";

import {
  applyFieldErrors,
  parseApiError,
  toastMessage,
} from "@gridcore/api-client";
import Button from "@gridcore/ui/components/Button";
import Field from "@gridcore/ui/components/Field";

import { login } from "../api";
import type { LoginRequest, MfaHandoff } from "../types";
import { useBranding } from "../useBranding";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import AuthShell from "./AuthShell";
import FormError from "./FormError";

const schema: ObjectSchema<LoginRequest> = object({
  // Phone or email, decided by the API from its shape — so the form cannot
  // reject something the server would have accepted.
  identifier: string().required("Enter your phone number or email address"),
  password: string().required("Password is required"),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const redirectAfterAuth = useAuthRedirect();
  const { branding } = useBranding();
  const [revealed, setRevealed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginRequest>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess(data) {
      // MFA is opt-in for a customer, so `complete` — a session on the first
      // call — is the common case; a challenge means one was enrolled.
      if (data.status === "complete") {
        void redirectAfterAuth();
        return;
      }
      const handoff: MfaHandoff = {
        challengeId: data.challengeId ?? "",
        factorType: data.factorType,
      };
      navigate("/mfa", { replace: true, state: handoff });
    },
    onError(err) {
      const problem = parseApiError(err);
      if (applyFieldErrors(problem, setError, ["identifier", "password"])) {
        setError("root.serverError", {
          type: problem.code,
          message: toastMessage(problem),
        });
      }
    },
  });

  return (
    <AuthShell
      branding={branding}
      title="Welcome back"
      subtitle="Sign in to buy credit and manage your meters."
    >
      <form
        onSubmit={handleSubmit((body) => mutation.mutate(body))}
        noValidate
        className="flex flex-col gap-5"
      >
        <FormError message={errors.root?.serverError?.message} />

        <Field
          label="Phone number or email"
          placeholder="+234 801 234 5678"
          error={errors.identifier?.message}
          endSlot={<Phone className="size-4 text-muted-foreground" aria-hidden />}
          autoFocus
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          {...register("identifier")}
        />

        <Field
          label="Password"
          type={revealed ? "text" : "password"}
          placeholder="Enter your password"
          error={errors.password?.message}
          autoComplete="current-password"
          endSlot={
            <button
              type="button"
              onClick={() => setRevealed((shown) => !shown)}
              tabIndex={-1}
              aria-label={revealed ? "Hide password" : "Show password"}
              className="rounded-sm p-1.5 text-muted-foreground hover:text-primary"
            >
              {revealed ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          }
          {...register("password")}
        />

        {/* No forgot-password: there is no v2 reset flow yet, and the person
            who can fix a locked-out customer is their merchant. */}
        <p className="-mt-1 text-center text-xs text-muted-foreground">
          Trouble signing in? Contact {branding?.name ?? "your provider"}.
        </p>

        <Button
          type="submit"
          text="Sign in"
          width="100%"
          size="xl"
          isLoading={mutation.isLoading}
        />
      </form>
    </AuthShell>
  );
}
