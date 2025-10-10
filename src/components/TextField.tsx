import type { InputHTMLAttributes } from "react";
import { cn } from "../utils/classNames";


type Props = InputHTMLAttributes<HTMLInputElement> & {
  leftDot?: boolean;
};

export default function TextField({ className, leftDot = true, ...props }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 shadow-inner backdrop-blur transition focus-within:border-[#29E3A6]">
      {leftDot && <span className="h-2 w-2 rounded-full bg-[#29E3A6] shadow-[0_0_0_3px_rgba(41,227,166,.25)]" />}
      <input
        {...props}
        className={cn(
          "w-full bg-transparent text-[15px] placeholder-slate-400 outline-none",
          className
        )}
      />
    </div>
  );
}
