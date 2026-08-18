import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { object, ref, string } from "yup";
import type { ObjectSchema } from "yup";

import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import Button from "@gridcore/ui/components/Button";
import Field from "@gridcore/ui/components/Field";

import { claimPassword } from "../api";
import { useBranding } from "../useBranding";
import AuthShell from "./AuthShell";
import FormError from "./FormError";

interface ClaimFields {
  newPassword: string;
  confirmPassword: string;
}

// Mirrors the server's policy. The server enforces it — this only saves a
// round trip, and must never be the only place it is stated.
const schema: ObjectSchema<ClaimFields> = object({
  newPassword: string()
    .min(8, "At least 8 characters")
    .matches(/[A-Z]/, "Include an uppercase letter")
    .matches(/\d/, "Include a digit")
    .matches(/[^A-Za-z0-9]/, "Include a special character")
    .required("Choose a password"),
  confirmPassword: string()
    .oneOf([ref("newPassword")], "Both passwords must match")
    .required("Repeat the password"),
});

const NO_LINK = "That link is not valid. Ask for a new one.";

/**
 * The customer's half of the claim (blueprint 44): the welcome SMS lands here,
 * on the merchant's own portal, branded as the merchant — GridCore is only
 * "powered by". D-058's rules carry over: the token leaves the address bar,
 * and a spent link is terminal rather than inviting a retry.
 */
export default function ClaimForm() {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read once, before the effect clears it — the link is a live credential.
  const [token] = useState(() => searchParams.get("token") ?? "");
  const [deadLink, setDeadLink] = useState(!token);

  useEffect(() => {
    if (searchParams.has("token")) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ClaimFields>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const claim = useMutation({
    mutationFn: (fields: ClaimFields) =>
      claimPassword({ token, newPassword: fields.newPassword }),
    // No session was set — sign in with the password that now works.
    onSuccess: () => navigate("/", { replace: true }),
    onError(err) {
      const problem = parseApiError(err);

      if (problem.status === 401) {
        setDeadLink(true);
        return;
      }

      if (applyFieldErrors(problem, setError, ["newPassword"])) {
        setError("root.serverError", {
          type: problem.code,
          message: toastMessage(problem),
        });
      }
    },
  });

  if (deadLink) {
    return (
      <AuthShell branding={branding} title="This link cannot be used" subtitle={NO_LINK}>
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            Set-password links work once and expire. Ask{" "}
            {branding?.name ?? "your provider"} to send a new one.
          </p>
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      branding={branding}
      title="Choose your password"
      subtitle={`Your ${branding?.name ?? ""} account is ready. Set a password to sign in.`}
    >
      <form
        onSubmit={handleSubmit((fields) => claim.mutate(fields))}
        noValidate
        className="flex flex-col gap-5"
      >
        <FormError message={errors.root?.serverError?.message} />

        <Field
          label="Password"
          placeholder="Choose a password"
          type="password"
          autoComplete="new-password"
          autoFocus
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <Field
          label="Repeat password"
          placeholder="Repeat the password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button
          type="submit"
          text="Set password and continue"
          width="100%"
          size="xl"
          isLoading={claim.isLoading}
        />
      </form>
    </AuthShell>
  );
}
