import { Link } from "@tanstack/react-router";

import { buttonClassName } from "@/components/ui/button-styles";

export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl font-extrabold text-brand-strong">404</p>
        <h1 className="mt-4 text-xl font-bold">Página no encontrada</h1>
        <p className="mt-2 text-sm text-ink-muted">
          La página que buscas no existe o se ha movido.
        </p>
        <Link to="/" className={buttonClassName({ className: "mt-6" })}>
          Ir a inicio
        </Link>
      </div>
    </main>
  );
}
