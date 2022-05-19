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
    <div>
      <button
        className={`flex items-center justify-end gap-x-2 rounded-lg p-2 transition duration-200 ${
          isMenuActive ? "bg-stone-700" : " hover:bg-slate-500/10"
        }`}
        onClick={() => setIsMenuActive(!isMenuActive)}
      >
        {props.children}
      </button>
      {isMenuActive ? (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-50"
          onClick={() => setIsMenuActive(false)}
        ></div>
      ) : null}
      <div className={`relative z-50`}>
        <div
          className={`absolute top-1 right-0 z-50 max-w-xs origin-top rounded-lg bg-stone-700 transition duration-200 ease-in-out ${
            isMenuActive ? "scale-y-100" : "scale-y-0"
          }`}
        >
          {props.items.map((menuItem) => (
            <button
              key={menuItem.key}
              onClick={() => {
                setIsMenuActive(false);
                menuItem.onClick();
              }}
              className="flex w-full items-center gap-x-2 rounded-lg px-4 py-2 text-inherit hover:bg-stone-800"
            >
              {createElement(menuItem.icon, { size: 18 })}
              <p className="truncate">{menuItem.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
