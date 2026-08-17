import { NavLink, Outlet } from "react-router-dom";

import BrandMark from "@gridcore/ui/components/BrandMark";
import { cn } from "@gridcore/ui/lib/utils";

import { useSession } from "@/auth/useSession";
import { useBranding, useSignOut } from "@/features/auth";

const nav = [
  { to: "/dashboard", label: "Home" },
  { to: "/my-meters", label: "My meters" },
  { to: "/topup", label: "Buy credit" },
  { to: "/payments", label: "Payments" },
  { to: "/analytics", label: "Usage" },
  { to: "/profile", label: "Profile" },
];

/**
 * The signed-in frame: the merchant's identity on the left — this is their
 * storefront, GridCore is the machinery — the person and sign-out on the right.
 */
export default function UserLayout() {
  const { session } = useSession();
  const { branding } = useBranding();
  const { signOut, isSigningOut } = useSignOut();

  return (
    <section className="min-h-svh bg-background">
      <header className="flex items-center justify-between border-b border-border px-8 py-4">
        <div className="flex items-center gap-3">
          <BrandMark
            src={branding?.logoUrl}
            name={branding?.name ?? session?.merchantName}
            className="size-9 rounded text-base"
          />
          <span className="text-base font-semibold text-primary">
            {branding?.name ?? session?.merchantName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {session ? `${session.firstName} ${session.lastName}` : ""}
          </span>
          <button
            type="button"
            onClick={signOut}
            disabled={isSigningOut}
            className="text-sm font-medium text-primary hover:underline disabled:opacity-60"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-border px-6 py-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </section>
  );
}
