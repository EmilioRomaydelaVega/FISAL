import { cn } from "@/lib/cn";

interface MachineAvatarProps {
  icon: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "size-9 text-lg", md: "size-11 text-2xl", lg: "size-14 text-3xl" } as const;

/** Icono (emoji) de una máquina dentro de un recuadro. */
export function MachineAvatar({ icon, size = "md", className }: MachineAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-surface-muted leading-none",
        sizes[size],
        className,
      )}
    >
      {icon}
    </span>
  );
}
