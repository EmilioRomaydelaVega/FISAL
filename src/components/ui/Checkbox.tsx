import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 text-sm font-medium text-ink-soft",
        className,
      )}
    >
      <input type="checkbox" className="size-4 shrink-0 cursor-pointer accent-brand" {...props} />
      {label}
    </label>
  );
}
