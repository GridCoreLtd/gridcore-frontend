import classNames from "classnames";
import { Link, useLocation } from "react-router-dom";

import { usePermissions } from "@/auth/usePermissions";
import { useScopes } from "@/auth/useScopes";
import { navFor, type ConsoleRoute } from "@/routes/manifest";

import MerchantSwitcher from "./MerchantSwitcher";

/**
 * Grouped by who the routes belong to, so an operator's sidebar reads as two
 * sections rather than one undifferentiated column. The groups come from the
 * manifest's `scope` — nothing here lists routes by hand.
 */
function groups(navigation: ConsoleRoute[]) {
  const shared = navigation.filter((item) => !item.scope);
  const platform = navigation.filter((item) => item.scope === "platform");
  const merchant = navigation.filter((item) => item.scope === "merchant");

  return [
    { label: "Overview", items: shared },
    { label: "Platform", items: platform },
    { label: "Account", items: merchant },
  ].filter((section) => section.items.length > 0);
}

export default function NavDrawer() {
  const { pathname } = useLocation();
  const { scopes } = useScopes();
  const { permissions } = usePermissions();

  // Rendered from the same manifest the router is built from, so the sidebar
  // can never offer a route this session isn't allowed to reach.
  const navigation = navFor(scopes, permissions);

  return (
    <div className="flex grow flex-col border-r border-border bg-background">
      <nav className="flex flex-1 flex-col gap-7 overflow-y-auto px-3 pt-6">
        {groups(navigation).map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-2 text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground/70 uppercase">
              {section.label}
            </p>
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      aria-current={active ? "page" : undefined}
                      className={classNames(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {/* The accent marks the active route and appears nowhere
                          else in the sidebar, so it stays a signal. */}
                      {active && (
                        <span
                          aria-hidden
                          className="absolute inset-y-2 left-1.5 w-0.5 rounded-full bg-secondary"
                        />
                      )}
                      {Icon && (
                        <Icon
                          className={classNames(
                            "size-[1.15rem] shrink-0",
                            active
                              ? "text-secondary"
                              : "text-muted-foreground/80 group-hover:text-foreground"
                          )}
                          aria-hidden
                        />
                      )}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <MerchantSwitcher />
      </div>
    </div>
  );
}
