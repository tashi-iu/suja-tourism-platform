import type { FunctionComponent } from "react";
import { createElement } from "react";

type IconButtonProps = {
  icon: FunctionComponent<any>;
  size: number;
  onClick: VoidFunction;
  title: string;
};

export default function IconButton(props: IconButtonProps) {
  return (
    <div
      className="cursor-pointer rounded-full p-1 hover:bg-slate-500/10"
      onClick={props.onClick}
      title={props.title}
    >
      {createElement(props.icon, {
        size: props.size,
        className: "text-slate-400/90",
      })}
    </div>
  );
}
