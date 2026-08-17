import { ChevronDown, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@gridcore/ui/components/ui/dropdown-menu";

import { useSession } from "@/auth/useSession";
import { useSignOut } from "@/features/auth";

export default function ProfileDropdown() {
  const { session } = useSession();
  const { signOut, isSigningOut } = useSignOut();

  // A platform operator acts for no merchant, so there is no name to show and
  // "GridCore" would be a brand string in a product white-labelled per merchant.
  const context = session?.merchantName || "Platform";
  const role = session?.role?.replace(/_/g, " ");

  return (
    <div className="flex items-center">
      <DropdownMenu>
        {/* Sits on the brand strip, so everything here reads against navy. */}
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full p-1 pr-2 transition-colors hover:bg-primary-foreground/10 focus:outline-hidden sm:rounded-lg">
          <span className="sr-only">Open user menu</span>
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
          >
            {session?.firstName?.[0]}
            {session?.lastName?.[0]}
          </span>
          <span className="hidden min-w-0 flex-col text-left sm:flex">
            <span className="truncate text-sm font-medium text-primary-foreground">
              {session?.firstName} {session?.lastName}
            </span>
            <span className="truncate text-xs text-primary-foreground/60 capitalize">
              {role ?? context}
            </span>
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-primary-foreground/60"
            aria-hidden
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 py-2">
          {session && (
            <>
              <DropdownMenuLabel className="px-4 py-1">
                <span className="block text-sm font-medium">
                  {session.firstName} {session.lastName}
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {context}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-[0.65rem] text-sm font-medium"
              >
                <Settings className="size-[1.15rem]" />
                <span>Profile Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={isSigningOut}
            onSelect={signOut}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive focus:text-destructive"
          >
            <LogOut className="size-[1.15rem]" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
