import { Link } from "react-router-dom";

import AuthShell from "./AuthShell";

/**
 * What `/forgot-password` and `/password-reset` say until v2 builds self-service
 * reset (D-058). Both used to POST to legacy endpoints this API does not serve,
 * so the forms looked live and could only fail — and the login screen links
 * here twice, for "Forgot your password?" and "Contact an admin". Sending the
 * reader to a person is the honest answer to both.
 */
export default function ComingSoonNotice() {
  return (
    <AuthShell
      title="Ask an administrator"
      subtitle="Resetting your own password is being rebuilt and is not available yet."
    >
      <div className="flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          An administrator on your team can set a new password for you. If you
          are the only administrator, contact GridCore support.
        </p>
        <Link
          to="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
