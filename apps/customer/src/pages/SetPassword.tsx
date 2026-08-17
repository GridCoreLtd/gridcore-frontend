import { SetPasswordForm } from "@/features/auth";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function SetPassword() {
  usePageTitle("New password");
  return <SetPasswordForm />;
}
