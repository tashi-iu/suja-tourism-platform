import type { FunctionComponent, PropsWithChildren } from "react";
import { createElement, useState } from "react";

type DropdownMenuItem = {
  key: string;
  icon: FunctionComponent<any>;
  onClick: VoidFunction;
  label: string;
};

type DropdownMenuProps = PropsWithChildren<{
  items: DropdownMenuItem[];
}>;

export default function DropdownMenu(props: DropdownMenuProps) {
  const [isMenuActive, setIsMenuActive] = useState(false);

  return (
    <div className={`relative`}>
      <button
        className={`flex transform items-center justify-end gap-x-2 p-2 duration-200 ${
          isMenuActive
            ? "rounded-t-lg bg-white/80"
            : "rounded-lg hover:bg-stone-500/10"
        }`}
        onClick={() => setIsMenuActive(!isMenuActive)}
      >
        {props.children}
      </button>

      <div
        className={`absolute top-11 left-0 right-0 origin-top rounded-b-lg bg-white/80 transition duration-200 ease-in-out ${
          isMenuActive ? "scale-y-100" : "scale-y-0"
        }`}
      >
        {props.items.map((menuItem) => (
          <button
            key={menuItem.key}
            onClick={menuItem.onClick}
            className="flex w-full items-center justify-between px-4 py-2 text-slate-500/80 last:rounded-b-lg hover:bg-slate-500/10"
          >
            {createElement(menuItem.icon, { size: 18 })}
            <span>{menuItem.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
