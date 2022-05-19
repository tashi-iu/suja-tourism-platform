import type { useFetcher } from "@remix-run/react";
import { NavLink, useNavigate } from "@remix-run/react";
import type { To } from "history";
import type { FunctionComponent } from "react";
import { createElement } from "react";
import { BiMenu } from "react-icons/bi";
import { FiLogOut } from "react-icons/fi";
import DropdownMenu from "./DropdownMenu";

type NavBarItem = {
  to: To;
  name: string;
  icon: FunctionComponent<any>;
  key: string;
  hidden?: boolean;
};

type NavBarProps = {
  items: NavBarItem[];
  fetcher: ReturnType<typeof useFetcher>;
  isAuthenticated: boolean;
};

export default function NavBar({
  fetcher,
  items,
  isAuthenticated,
}: NavBarProps) {
  const navigate = useNavigate();
  const menuItems = items.filter((item) => !item.hidden);
  return (
    <div>
      <div className="sticky top-0 flex w-screen items-center justify-between py-2.5 px-4 md:hidden">
        <img src="assets/images/logo.png" alt="Suja" className="w-20" />
        <DropdownMenu
          items={[
            ...menuItems.map((item) => ({
              icon: item.icon,
              key: item.key,
              label: item.name,
              onClick: () => {
                navigate(item.to);
              },
            })),
            ...(isAuthenticated
              ? [
                  {
                    icon: FiLogOut,
                    key: "logout",
                    label: "Log Out",
                    onClick: () => {
                      fetcher.submit(null, {
                        action: "/api/sign-out",
                        method: "post",
                        replace: true,
                      });
                    },
                  },
                ]
              : []),
          ]}
        >
          <BiMenu size={24} title="Menu" />
        </DropdownMenu>
      </div>
      <div className="hidden md:block">
        <div className="flex justify-between gap-x-2 rounded-b-2xl bg-stone-700/40 px-4 py-2.5 align-middle">
          {menuItems.map((item) => (
            <NavLink
              to={item.to}
              key={item.key}
              title={item.name}
              className={({ isActive }) =>
                `rounded p-2 ${
                  isActive ? "bg-slate-500/50" : "hover:bg-slate-500/10"
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center justify-center">
                  {createElement(item.icon, {
                    size: 22,
                    className: `${
                      isActive ? "text-white/90" : "text-slate-400/90"
                    }`,
                  })}
                  <p
                    className={`text-sm ${
                      isActive ? "text-white/90" : "text-slate-400/90"
                    }`}
                  >
                    {item.name}
                  </p>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
