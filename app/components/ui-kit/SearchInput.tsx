import type { ChangeEventHandler } from "react";
import { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { MdClear } from "react-icons/md";

type SearchInputProps = {
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
};

export default function SearchInput(props: SearchInputProps) {
  const [value, setValue] = useState(props.value ?? "");

  const hasValue = !!value;

  const onClear = () => {
    setValue("");
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    props.onChange?.(event.target.value);
    setValue(event.target.value);
  };

  useEffect(() => {
    setValue(value);
  }, [value]);

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-slate-500/60 p-2">
      <IoIosSearch size="24" className="text-slate-300/80" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={props.placeholder}
        className="w-full flex-1 bg-transparent text-slate-300/80 outline-none"
      />
      <MdClear
        onClick={onClear}
        size="24"
        className={`${
          hasValue ? "opacity-100" : "opacity-0"
        } cursor-pointer text-slate-300/80 transition duration-150 ease-in-out`}
      />
    </div>
  );
}
