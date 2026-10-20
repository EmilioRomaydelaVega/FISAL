import { BRAND_NAME, LOGO_URL } from "@/constants/brand";
import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={LOGO_URL}
      alt={BRAND_NAME}
      width={1009}
      height={294}
      className={cn("h-9 w-auto", className)}
    />
  );
}
