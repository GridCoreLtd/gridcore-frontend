import { useSession } from "@/auth/useSession";
import { useBranding } from "@/features/auth";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * The shell landing (blueprint 32 ruling): the person, their merchant, and the
 * honest state of the rebuild. The first real content — meters, balance —
 * arrives with its customer read model.
 */
export default function Dashboard() {
  usePageTitle("Dashboard");
  const { session } = useSession();
  const { branding } = useBranding();

  return (
    <div className="flex flex-col items-start gap-2 px-8 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-primary">
        Welcome back{session ? `, ${session.firstName}` : ""}
      </h1>
      <p className="text-sm text-muted-foreground">
        Your {branding?.name ?? "prepaid"} account is signed in. Meters,
        balances and purchases are being rebuilt and will appear here shortly.
      </p>
    </div>
  );
}
