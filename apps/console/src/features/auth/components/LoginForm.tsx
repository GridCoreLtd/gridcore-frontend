import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AtSign, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
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
      // No cookie is set by this call. A session exists only after the second
      // factor, so there is nothing to route on but the challenge.
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
      title="Welcome back"
      subtitle="Sign in to manage your meters, customers and payouts."
      headerSlot={
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          {/* The prefix is the first thing to go on a narrow phone: the link
              still says what it does without it. */}
          <span className="hidden sm:inline">Need access? </span>
          <Link
            to="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Contact an admin
          </Link>
        </span>
      }
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
          endSlot={
            <AtSign className="size-4 text-muted-foreground" aria-hidden />
          }
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
              // Not in the tab order: stopping between the password and the
              // submit button to skip a convenience is not a convenience.
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

        <div className="-mt-1 flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

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
