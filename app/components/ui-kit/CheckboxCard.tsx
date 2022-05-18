import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

type CheckboxCardProps = PropsWithChildren<{
  id: string;
  value: string | number;
  name?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}>;

export default function CheckboxCard({
  id,
  name,
  value,
  checked,
  onChange,
  children,
}: CheckboxCardProps) {
  const [isChecked, setIsChecked] = useState<boolean>(!!checked);

  useEffect(() => {
    if (checked == null) return;
    setIsChecked(checked);
  }, [checked]);

  useEffect(() => {
    onChange?.(isChecked);
  }, [isChecked, onChange]);

  return (
    <div key={id} className="flex flex-col items-stretch">
      <input
        id={id}
        type="check"
        name={name}
        defaultValue={value}
        defaultChecked={isChecked}
        hidden
      ></input>
      <div
        onClick={() => setIsChecked(!isChecked)}
        className={`flex flex-1 cursor-pointer select-none flex-col items-center justify-center rounded border border-stone-500/30 p-4 transition duration-300 ease-in-out focus:bg-stone-400 ${
          isChecked
            ? "bg-stone-500 text-white/80"
            : "bg-white text-stone-500/80"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
