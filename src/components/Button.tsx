import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/classNames";


type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  asFull?: boolean;
};

export default function Button({ className, asFull = true, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        asFull && "w-full",
        "rounded-full bg-gradient-to-r from-[#29E3A6] to-[#66e6ff] px-6 py-3 text-[15px] font-semibold text-slate-900 shadow-[0_10px_30px_rgba(16,214,161,.35)] transition hover:brightness-110 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#29E3A6]/50",
        className
      )}
    />
  );
}
