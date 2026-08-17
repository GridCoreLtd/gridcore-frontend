import { useState } from "react";

import { Menu } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@gridcore/ui/components/ui/sheet";

import { consoleRoutes } from "@/routes/manifest";

import Breadcrumbs from "./Breadcrumbs";
import NavDrawer from "./NavDrawer";
import ProfileDropdown from "./ProfileDropdown";

/**
 * The manifest already names every route; the page title comes from it.
 * Exact match only — a detail page owns its own header, not its list's.
 */
function titleFor(pathname: string): string {
  return consoleRoutes.find((r) => r.label && r.path === pathname)?.label ?? "";
}

export default function ConsoleLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = titleFor(pathname);

  return (
    <div className="min-h-svh bg-muted/60">
      {/* One brand strip across the full width; everything else sits under it. */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-4 bg-primary px-4 sm:px-6">
        <button
          type="button"
          className="-m-2 rounded-md p-2 text-primary-foreground hover:bg-primary-foreground/10 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="size-5" aria-hidden />
        </button>

        <img src="/images/logo-yellow.png" width={128} alt="GridCore" />

        <div className="ml-auto flex items-center">
          <ProfileDropdown />
        </div>
      </header>

      {/* Mobile navigation. The desktop sidebar below is always mounted. */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-full max-w-68 border-0 p-0 lg:hidden"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <NavDrawer />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <NavDrawer />
      </div>

      <div className="flex min-h-svh flex-col pt-16 lg:pl-64">
        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Renders itself away on a top-level screen, where it says nothing. */}
          <Breadcrumbs />
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              {/* The brand's second colour, on every page the manifest names. */}
              <span aria-hidden className="mt-1.5 block h-1 w-10 rounded-full bg-secondary" />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
