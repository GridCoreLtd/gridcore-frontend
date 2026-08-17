import { useState } from "react";

import classNames from "classnames";
import { useAtom } from "jotai";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@gridcore/ui/components/ui/collapsible";

import { userAtom } from "@gridcore/api-client";

import ProfileDropdown from "./ProfileDropdown";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Top Up Meter", href: "/topup" },
  { name: "Payments", href: "/payments" },
  { name: "Monitoring and Control", href: "/analytics" },
];

export default function NavBar() {
  const { pathname } = useLocation();
  const [user] = useAtom(userAtom);
  const [logoFailed, setLogoFailed] = useState(false);
  // Radix has no render-prop for open state, and the trigger icon depends on it.
  const [menuOpen, setMenuOpen] = useState(false);

  const merchant = user?.associatedMerchant;
  const businessLogo = merchant?.businessLogo;
  const businessName = merchant?.businessName;

  return (
    <Collapsible asChild open={menuOpen} onOpenChange={setMenuOpen}>
      <nav className="gradient-b bg-primary">
        <div className="container">
          <div className="relative flex h-[4.5rem] items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button*/}
              <CollapsibleTrigger className="inline-flex items-center justify-center rounded-md p-2 text-white">
                <span className="sr-only">Open main menu</span>
                {menuOpen ? (
                  <X className="block h-7 w-7" aria-hidden="true" />
                ) : (
                  <Menu className="block h-7 w-7" aria-hidden="true" />
                )}
              </CollapsibleTrigger>
            </div>

            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="hidden sm:flex flex-shrink-0 items-center">
                <Link to="/dashboard" className="inline-flex items-center">
                  {businessLogo && !logoFailed ? (
                    <span className="inline-flex bg-white p-2 rounded-lg">
                      <img
                        src={businessLogo}
                        alt={businessName || "Merchant logo"}
                        className="h-auto w-auto max-w-24 max-h-[40px] object-contain"
                        onError={() => setLogoFailed(true)}
                      />
                    </span>
                  ) : (
                    <span className="text-white font-semibold text-lg truncate max-w-[180px]">
                      {businessName || "PayGo Dash"}
                    </span>
                  )}
                </Link>
              </div>

              <div className="hidden sm:ml-8 sm:flex items-center">
                <div className="flex gap-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        pathname === item.href
                          ? "bg-secondary text-black font-[700]"
                          : "text-gray-400 hover:text-gray-300 font-normal",
                        "rounded-md p-3 text-sm"
                      )}
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <ProfileDropdown />
          </div>
        </div>

        <CollapsibleContent className="sm:hidden">
          <div className="flex flex-col gap-1.5 px-2 pt-2 pb-5">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={classNames(
                  pathname === item.href
                    ? "bg-secondary text-black"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "block rounded-md px-3 py-2 text-lg font-medium"
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.name}
              </a>
            ))}
          </div>
        </CollapsibleContent>
      </nav>
    </Collapsible>
  );
}
