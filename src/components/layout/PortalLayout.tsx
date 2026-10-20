import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";

import { Logo } from "./Logo";

interface PortalLayoutProps {
  subtitle: string;
  onExit?: () => void;
  exitLabel?: string;
  children: ReactNode;
}

/** Estructura común de las pantallas del portal de cliente. */
export function PortalLayout({
  subtitle,
  onExit,
  exitLabel = "Salir",
  children,
}: PortalLayoutProps) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo className="h-8" />
            <span className="border-l border-border pl-3 text-xs font-medium tracking-wide text-ink-muted uppercase">
              {subtitle}
            </span>
          </div>
          {onExit && (
            <Button variant="ghost" size="sm" onClick={onExit}>
              <LogOut aria-hidden="true" />
              {exitLabel}
            </Button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
