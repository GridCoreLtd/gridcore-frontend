import { LoginForm } from "@/features/auth";
import { usePageTitle } from "@/hooks/usePageTitle";

/** The white-label sign-in: the subdomain names the merchant (D-020). */
export default function Login() {
  usePageTitle("Sign in");
  return <LoginForm />;
}
