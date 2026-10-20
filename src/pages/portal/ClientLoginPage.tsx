import { useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";

import { PortalLayout } from "@/components/layout/PortalLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useClientLogin } from "@/hooks/portal/useClientLogin";

export function ClientLoginPage() {
  const navigate = useNavigate();
  const { code, setCode, error, loading, login } = useClientLogin();

  const enter = async () => {
    if (await login()) await navigate({ to: "/cliente/maquinas" });
  };

  return (
    <PortalLayout subtitle="Portal de cliente">
      <div className="mx-auto max-w-md pt-4 sm:pt-10">
        <h1 className="text-3xl font-extrabold">
          Parte <span className="text-brand-strong">diario</span>
        </h1>
        <p className="mt-2 text-ink-muted">
          Introduce el código que te ha facilitado FISALRENT para ver tus máquinas alquiladas.
        </p>
        <Card padding="lg" className="mt-8">
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void enter();
            }}
          >
            <Field label="Código de cliente">
              {(id) => (
                <Input
                  id={id}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="h-12 font-mono text-lg font-semibold tracking-widest uppercase"
                  placeholder="FISAL-0000"
                  value={code}
                  aria-invalid={Boolean(error)}
                  onChange={(event) => {
                    setCode(event.target.value);
                  }}
                />
              )}
            </Field>
            {error && (
              <Alert tone="danger" className="mt-3">
                {error}
              </Alert>
            )}
            <Button type="submit" size="lg" className="mt-5 w-full" disabled={loading}>
              <KeyRound aria-hidden="true" />
              {loading ? "Comprobando…" : "Entrar"}
            </Button>
          </form>
        </Card>
      </div>
    </PortalLayout>
  );
}
