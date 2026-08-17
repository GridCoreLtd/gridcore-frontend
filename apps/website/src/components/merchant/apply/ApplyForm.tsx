import { useEffect, useRef, useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import { SelectField, TextArea, TextField } from "@gridcore/ui/components/FormField";

import { listCountries, requestApplicationOtp, submitApplication } from "./api";
import { CodeField } from "./CodeField";
import { FilePicker } from "./FilePicker";
import {
  applicationSchema,
  DOCUMENT_TYPES,
  LOGO_TYPES,
  MAX_DOCUMENT_MB,
  MAX_LOGO_MB,
  STEP_FIELDS,
} from "./schema";
import type { ApplicationFields } from "./schema";
import { STEPS, StepRail } from "./StepRail";
import { SubdomainField } from "./SubdomainField";
import { Submitted } from "./Submitted";
import { useDraft } from "./useDraft";

/** The API names two fields differently from the form. */
const API_TO_FORM: Record<string, string> = {
  shortBusinessName: "shortBusinessName",
  email: "email",
  phone: "phone",
};

const RESEND_SECONDS = 60;

const portalDomain = import.meta.env.PUBLIC_PORTAL_DOMAIN || "gridcore.com";

/** A country code renders as a name in the browser rather than through the API. */
const countryName = (code: string) => {
  try {
    return new Intl.DisplayNames(undefined, { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

export default function ApplyForm() {
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [challengeId, setChallengeId] = useState<string>();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitted, setSubmitted] = useState<ApplicationFields>();
  const heading = useRef<HTMLHeadingElement>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFields>({
    resolver: yupResolver(applicationSchema) as never,
    mode: "onTouched",
    defaultValues: { country: "", website: "", description: "", code: "" },
  });

  useDraft(watch, setValue);

  const countries = useQuery({ queryKey: ["countries"], queryFn: listCountries });

  // One country open means there is nothing to choose — pick it rather than
  // making someone open a select with a single option in it.
  useEffect(() => {
    const only = countries.data?.length === 1 ? countries.data[0] : undefined;
    if (only) setValue("country", only.code);
  }, [countries.data, setValue]);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Moving between steps is a navigation, so say so — otherwise a screen reader
  // hears nothing and a long page leaves the reader scrolled past the fields.
  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  const sendCode = useMutation({
    mutationFn: async () => {
      const valid = await trigger("phone");
      if (!valid) throw new Error("phone");
      return requestApplicationOtp(watch("phone"));
    },
    onSuccess: (data) => {
      setChallengeId(data.challengeId);
      setSecondsLeft(RESEND_SECONDS);
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "phone") return;
      const problem = parseApiError(error);
      // A rejected phone belongs on the phone input, not in a toast the reader
      // has to remember while scrolling.
      if (applyFieldErrors(problem, setError, ["phone"])) {
        setError("phone", { type: problem.code, message: toastMessage(problem) });
      }
    },
  });

  const apply = useMutation({
    mutationFn: (fields: ApplicationFields) => submitApplication(challengeId ?? "", fields),
    onSuccess: (_result, fields) => setSubmitted(fields),
    onError: (error) => {
      const problem = parseApiError(error);
      const mapped = {
        ...problem,
        fieldErrors: problem.fieldErrors.map((e) => ({
          ...e,
          field: API_TO_FORM[e.field] ?? e.field,
        })),
      };

      // 503 is ours, not theirs: the code they typed is still good, and the
      // application is still exactly as they left it, so the only honest advice
      // is to press the button again.
      if (problem.status === 503) {
        setError("root.serverError", {
          type: problem.code,
          message: "We could not store your documents just now. Nothing was lost — try again.",
        });
        return;
      }

      // A wrong or expired code comes back as a 401 naming nothing, so it is put
      // where it can be fixed rather than left as a mystery.
      if (problem.status === 401) {
        setError("code", { type: problem.code, message: "That code is not right, or it expired." });
        return;
      }
      if (applyFieldErrors(mapped, setError, Object.keys(applicationSchema.fields))) {
        setError("root.serverError", { type: problem.code, message: toastMessage(mapped) });
      }
    },
  });

  const next = async () => {
    if (!(await trigger(STEP_FIELDS[step] as never))) return;
    const to = Math.min(step + 1, STEPS.length - 1);
    setStep(to);
    setFurthest((f) => Math.max(f, to));
  };

  if (submitted) {
    return (
      <Submitted
        businessName={submitted.businessName}
        portalHost={`${submitted.shortBusinessName}.${portalDomain}`}
        phone={submitted.phone}
      />
    );
  }

  const rootError = errors.root?.serverError?.message;

  return (
    <div className="grid gap-10 lg:grid-cols-[19rem_1fr] lg:gap-16">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <StepRail current={step} furthest={furthest} onJump={setStep} />
      </aside>

      <form
        onSubmit={handleSubmit((fields) => apply.mutate(fields))}
        noValidate
        className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <h3
          ref={heading}
          tabIndex={-1}
          className="text-xl font-semibold text-primary outline-none sm:text-2xl"
        >
          {STEPS[step].title}
        </h3>
        <p className="mt-1 text-sm text-primary/65">{STEPS[step].blurb}</p>

        <div className="mt-8 flex flex-col gap-5">
          {step === 0 && (
            <>
              <TextField
                label="Business name"
                placeholder="Danjuma Power Limited"
                error={errors.businessName?.message}
                {...register("businessName")}
              />

              <Controller
                control={control}
                name="shortBusinessName"
                render={({ field }) => (
                  <SubdomainField
                    {...field}
                    portalDomain={portalDomain}
                    error={errors.shortBusinessName?.message}
                    onChange={(event) => field.onChange(event.target.value.toLowerCase())}
                  />
                )}
              />

              <SelectField
                label="Country"
                error={errors.country?.message}
                hint={
                  countries.isError
                    ? "We could not load the list — refresh and try again."
                    : "Where the business operates."
                }
                disabled={countries.isLoading}
                {...register("country")}
              >
                <option value="">
                  {countries.isLoading ? "Loading…" : "Select a country"}
                </option>
                {countries.data?.map((country) => (
                  <option key={country.code} value={country.code}>
                    {countryName(country.code)}
                  </option>
                ))}
              </SelectField>

              <TextField
                label="Business address"
                placeholder="3 Ring Road, Jos"
                error={errors.address?.message}
                {...register("address")}
              />
              <TextField
                label="Website"
                optional
                placeholder="https://example.com"
                error={errors.website?.message}
                {...register("website")}
              />
              <TextArea
                label="What the business does"
                optional
                rows={3}
                placeholder="Solar mini-grids for households and small businesses."
                error={errors.description?.message}
                {...register("description")}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Controller
                control={control}
                name="logo"
                render={({ field }) => (
                  <FilePicker
                    id="logo"
                    label="Your logo"
                    hint="This is the branding your customers see on your portal."
                    accept={LOGO_TYPES}
                    maxMB={MAX_LOGO_MB}
                    preview
                    value={field.value}
                    error={errors.logo?.message}
                    onPick={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="cac"
                render={({ field }) => (
                  <FilePicker
                    id="cac"
                    label="CAC certificate"
                    hint="Your business registration. Private — only a reviewer opens it."
                    accept={DOCUMENT_TYPES}
                    maxMB={MAX_DOCUMENT_MB}
                    value={field.value}
                    error={errors.cac?.message}
                    onPick={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="governmentId"
                render={({ field }) => (
                  <FilePicker
                    id="governmentId"
                    label="Your government ID"
                    hint="For the person who will administer the account. Also private."
                    accept={DOCUMENT_TYPES}
                    maxMB={MAX_DOCUMENT_MB}
                    value={field.value}
                    error={errors.governmentId?.message}
                    onPick={field.onChange}
                  />
                )}
              />
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="First name"
                  autoComplete="given-name"
                  error={errors.firstName?.message}
                  {...register("firstName")}
                />
                <TextField
                  label="Last name"
                  autoComplete="family-name"
                  error={errors.lastName?.message}
                  {...register("lastName")}
                />
              </div>
              <TextField
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted p-4">
                <TextField
                  label="Phone number"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+234 801 234 5678"
                  hint="We text your approval and your set-password link here."
                  error={errors.phone?.message}
                  {...register("phone")}
                />

                {!challengeId ? (
                  <button
                    type="button"
                    onClick={() => sendCode.mutate()}
                    disabled={sendCode.isLoading}
                    className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                  >
                    {sendCode.isLoading ? "Sending…" : "Send me a code"}
                  </button>
                ) : (
                  <>
                    <Controller
                      control={control}
                      name="code"
                      render={({ field }) => (
                        <CodeField
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          error={errors.code?.message}
                        />
                      )}
                    />
                    <p className="text-xs text-primary/65">
                      {secondsLeft > 0 ? (
                        <>You can ask for another in {secondsLeft}s</>
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendCode.mutate()}
                          disabled={sendCode.isLoading}
                          className="font-medium text-primary underline underline-offset-4 hover:no-underline disabled:opacity-60"
                        >
                          Send another code
                        </button>
                      )}
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {rootError && (
          <p role="alert" className="mt-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {rootError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary/60 transition hover:text-primary"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition hover:brightness-105"
            >
              Continue
              <ArrowRight className="size-4" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={apply.isLoading || !challengeId}
              className="flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition hover:brightness-105 disabled:opacity-50"
            >
              {apply.isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {apply.isLoading ? "Sending…" : "Send application"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
