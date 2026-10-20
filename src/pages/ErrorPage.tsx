import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { buttonClassName } from "@/components/ui/button-styles";

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold">No se ha podido cargar la página</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Algo ha fallado. Puedes reintentarlo o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              void router.invalidate();
              reset();
            }}
          >
            Reintentar
          </Button>
          <a href="/" className={buttonClassName({ variant: "secondary" })}>
            Ir a inicio
          </a>
        </div>
      </div>
    </main>
  );
}
