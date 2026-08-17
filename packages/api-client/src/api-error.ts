import { AxiosError } from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Normalises every failure shape the API can produce into one object, and maps
 * field-level failures onto the form control that caused them.
 *
 * See architecture/10-api-errors.md for the wire contract.
 */

export interface ApiFieldError {
  /** Dot path into the request body, e.g. "emailAddress", "bank.accountNumber" */
  field: string;
  /** Machine-readable reason, e.g. "required", "already_registered" */
  code: string;
  /** Human sentence to render under the input */
  message: string;
}

export interface ApiProblem {
  status: number;
  /** Machine-readable slug. Branch on this, never on `detail`. */
  code: string;
  /** Human sentence, safe to show the user. */
  detail: string;
  title: string;
  /** Correlates to server logs — surface it on 5xx so support can trace it. */
  traceId?: string;
  fieldErrors: ApiFieldError[];
}

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

const problem = (p: Partial<ApiProblem> & { status: number; code: string }) => ({
  title: p.title ?? "Error",
  detail: p.detail ?? GENERIC_MESSAGE,
  fieldErrors: p.fieldErrors ?? [],
  ...p,
});

/**
 * Accepts an AxiosError, a bare Error, or anything thrown, and always returns
 * an ApiProblem. Never throws.
 */
export function parseApiError(error: unknown): ApiProblem {
  if (error instanceof AxiosError) {
    // No response at all: offline, DNS failure, CORS, timeout, aborted.
    if (!error.response) {
      const offline =
        typeof navigator !== "undefined" && navigator.onLine === false;
      return problem({
        status: 0,
        code: offline ? "offline" : "network_error",
        title: "Connection problem",
        detail: offline
          ? "You appear to be offline. Check your connection and try again."
          : "Could not reach the server. Check your connection and try again.",
      });
    }

    const { status, data } = error.response;

    // The API returned something that isn't JSON — typically an HTML error page
    // from a proxy, or a 404 from the static host when the base URL is wrong.
    if (typeof data !== "object" || data === null) {
      return problem({
        status,
        code: "unexpected_response",
        title: "Unexpected response",
        detail:
          status === 404
            ? "That endpoint was not found. The API base URL may be misconfigured."
            : GENERIC_MESSAGE,
      });
    }

    const body = data as Record<string, any>;

    // RFC 9457 problem+json — the contract in architecture/10-api-errors.md.
    if (Array.isArray(body.errors) || body.code) {
      return problem({
        status: body.status ?? status,
        code: body.code ?? "error",
        title: body.title ?? "Error",
        detail: body.detail ?? GENERIC_MESSAGE,
        traceId: body.traceId,
        fieldErrors: (body.errors ?? [])
          .filter((e: any) => e && typeof e.field === "string")
          .map((e: any) => ({
            field: e.field,
            code: e.code ?? "invalid",
            message: e.message ?? "This value is not valid.",
          })),
      });
    }

    // Legacy shape: { message: string | string[] }. Kept so the frontend keeps
    // working against the current backend during the migration.
    const legacy = body.message;
    return problem({
      status,
      code: "error",
      detail:
        (Array.isArray(legacy) ? legacy[0] : legacy) ??
        body.error ??
        GENERIC_MESSAGE,
    });
  }

  if (error instanceof Error) {
    return problem({ status: 0, code: "client_error", detail: error.message });
  }

  return problem({ status: 0, code: "unknown", detail: GENERIC_MESSAGE });
}

/**
 * Attaches each field error to its form control.
 *
 * Returns `true` when the failure could NOT be expressed on any field — which
 * is the only situation that justifies a toast. Errors naming a field the form
 * doesn't have are attached to the form root rather than dropped silently, so a
 * backend/frontend field-name mismatch is visible instead of invisible.
 */
export function applyFieldErrors<T extends FieldValues>(
  problem: ApiProblem,
  setError: UseFormSetError<T>,
  knownFields?: readonly string[]
): boolean {
  if (problem.fieldErrors.length === 0) return true;

  let attachedToField = false;
  const orphaned: ApiFieldError[] = [];

  for (const fieldError of problem.fieldErrors) {
    const isKnown = !knownFields || knownFields.includes(fieldError.field);

    if (isKnown) {
      setError(fieldError.field as Path<T>, {
        type: fieldError.code,
        message: fieldError.message,
      });
      attachedToField = true;
    } else {
      orphaned.push(fieldError);
    }
  }

  if (orphaned.length > 0) {
    setError("root.serverError" as Path<T>, {
      type: "server",
      message: orphaned.map((e) => e.message).join(" "),
    });
    if (import.meta.env.DEV) {
      console.warn(
        "[api-error] server reported fields this form does not have:",
        orphaned.map((e) => e.field)
      );
    }
    // Shown on the form, so still no toast needed.
    return false;
  }

  return !attachedToField;
}

/** Message for a toast, with the trace id appended on server faults. */
export function toastMessage(problem: ApiProblem): string {
  return problem.status >= 500 && problem.traceId
    ? `${problem.detail} (ref: ${problem.traceId})`
    : problem.detail;
}
