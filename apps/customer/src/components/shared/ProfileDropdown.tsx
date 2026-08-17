import classNames from "classnames";
import { useAtom } from "jotai";
import Cookies from "js-cookie";
import { ChevronDown, CircleUser, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@gridcore/ui/components/ui/dropdown-menu";

import { userAtom } from "@gridcore/api-client";

export default function ProfileDropdown() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [user, setUser]: any = useAtom(userAtom);

  const handleSignOut = () => {
    Cookies.remove("access_token");
    setUser(null);
    navigate(
      user?.associatedMerchant
        ? user?.associatedMerchant?.shortBusinessName
        : "/",
    );
  };

  const menuItems = [
    {
      name: "Profile Settings",
      url: "/profile",
      icon: "/icons/setting.svg",
    },
    {
      name: "My Meters",
      url: "/my-meters",
      icon: "/icons/meter.svg",
    },
  ];

  return (
    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
      <DropdownMenu>
        <DropdownMenuTrigger className="ml-3 flex items-center gap-3 rounded-full text-sm text-white focus:outline-hidden">
          <span className="sr-only">Open user menu</span>
          <CircleUser className="h-7 w-7" />
          <span className="text-sm font-normal">{user?.firstName}</span>
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48 py-2">
          <DropdownMenuGroup>
            {menuItems.map((item) => (
              <DropdownMenuItem key={item.url} asChild>
                <Link
                  to={item.url}
                  className={classNames(
                    pathname === item.url ? "bg-gray-200" : "",
                    "flex items-center gap-2 px-4 py-[0.65rem] text-sm font-medium",
                  )}
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="h-[1.15rem] w-[1.15rem]"
                  />
                  <span>{item.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={handleSignOut}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 focus:text-red-600"
          >
            <LogOut className="h-[1.15rem] w-[1.15rem]" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
