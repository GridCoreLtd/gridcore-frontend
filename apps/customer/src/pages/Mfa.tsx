import { MfaForm } from "@/features/auth";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Mfa() {
  usePageTitle("Verify code");
  return <MfaForm />;
}
