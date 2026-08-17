import { useEffect } from "react";

import type { UseFormSetValue, UseFormWatch } from "react-hook-form";

import type { ApplicationFields } from "./schema";

const KEY = "gridcore.application.draft";

/**
 * Text only. Files are never stored — they cannot be serialised meaningfully and
 * a government ID does not belong in web storage — and neither is the code,
 * which is a live credential with a five-minute life.
 *
 * sessionStorage rather than localStorage: this survives the refresh it exists
 * for, and does not leave a business's details on a shared machine after the tab
 * closes.
 */
const PERSISTED = [
  "businessName",
  "shortBusinessName",
  "country",
  "address",
  "website",
  "description",
  "firstName",
  "lastName",
  "email",
  "phone",
] as const;

export function useDraft(
  watch: UseFormWatch<ApplicationFields>,
  setValue: UseFormSetValue<ApplicationFields>
) {
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (!saved) return;
      const draft = JSON.parse(saved) as Partial<Record<(typeof PERSISTED)[number], string>>;
      for (const field of PERSISTED) {
        if (draft[field]) setValue(field, draft[field] as never);
      }
    } catch {
      // A corrupt or blocked store is not worth failing a form over.
    }
  }, [setValue]);

  useEffect(() => {
    const subscription = watch((values) => {
      const draft: Record<string, string> = {};
      for (const field of PERSISTED) {
        const value = values[field];
        if (typeof value === "string" && value) draft[field] = value;
      }
      try {
        sessionStorage.setItem(KEY, JSON.stringify(draft));
      } catch {
        // Private mode, quota, or storage disabled entirely.
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);
}
