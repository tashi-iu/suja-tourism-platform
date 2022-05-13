import { NavLink } from "@remix-run/react";
import type { To } from "history";
import type { FunctionComponent } from "react";
import { createElement } from "react";

type NavBarItem = {
  to: To;
  name: string;
  icon: FunctionComponent<any>;
  key: string;
  hidden?: boolean;
};

type NavBarProps = {
  items: NavBarItem[];
};

export default function NavBar(props: NavBarProps) {
  return (
    <div className="flex justify-center gap-x-2 rounded-b-2xl bg-slate-200/50 py-2.5 px-4 align-middle">
      {props.items
        .filter((item) => !item.hidden)
        .map((item) => (
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
            {({ isActive }) =>
              createElement(item.icon, {
                size: 22,
                className: `${
                  isActive ? "text-white/90" : "text-slate-500/80"
                }`,
              })
            }
          </NavLink>
        ))}
    </div>
  );
}
