import { ClaimForm } from "@/features/auth";
import { usePageTitle } from "@/hooks/usePageTitle";

/** The welcome SMS's landing: one-time set-password on the merchant's portal. */
export default function Claim() {
  usePageTitle("Set your password");
  return <ClaimForm />;
}
