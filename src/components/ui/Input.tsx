import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export const controlClassName =
  "w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-ink shadow-xs transition-colors placeholder:text-ink-subtle hover:border-ink-subtle focus-visible:border-focus focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus/20 disabled:bg-surface-muted";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClassName, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClassName, "min-h-20 py-2", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClassName, "h-10 pr-8", className)} {...props} />;
}
