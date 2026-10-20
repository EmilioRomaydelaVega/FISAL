import {
  ClipboardList,
  FolderClock,
  House,
  Plus,
  Settings2,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/cn";

import { Logo } from "./Logo";

export type BackofficeView =
  "home" | "new" | "machines" | "fleet" | "clients" | "checks" | "history";

const NAV_ITEMS: { view: BackofficeView; label: string; icon: LucideIcon }[] = [
  { view: "home", label: "Inicio", icon: House },
  { view: "new", label: "Nueva inspección", icon: Plus },
  { view: "machines", label: "Máquinas", icon: Settings2 },
  { view: "fleet", label: "Flota", icon: Truck },
  { view: "clients", label: "Clientes", icon: Users },
  { view: "checks", label: "Partes diarios", icon: ClipboardList },
  { view: "history", label: "Historial", icon: FolderClock },
];

interface BackofficeHeaderProps {
  current: BackofficeView;
  onNavigate: (view: BackofficeView) => void;
}

export function BackofficeHeader({ current, onNavigate }: BackofficeHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="border-l border-border pl-3 text-xs leading-tight font-medium tracking-wide text-ink-muted uppercase">
            Inspección de
            <br />
            maquinaria Komatsu
          </span>
        </div>
        <nav aria-label="Secciones" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <ul className="flex gap-1">
            {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
              const active = view === current;
              const isPrimary = view === "new";
              return (
                <li key={view}>
                  <button
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      onNavigate(view);
                    }}
                    className={cn(
                      "flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors [&_svg]:size-4",
                      active
                        ? "bg-brand-soft text-brand-strong"
                        : isPrimary
                          ? "text-ink hover:bg-surface-muted"
                          : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                    )}
                  >
                    <Icon aria-hidden="true" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
