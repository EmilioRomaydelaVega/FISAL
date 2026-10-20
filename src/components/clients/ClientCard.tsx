import { Ban, CheckCircle2, Copy, MessageCircle, Pencil, Trash2, Truck } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { buttonClassName } from "@/components/ui/button-styles";
import { Card } from "@/components/ui/Card";
import {
  buildPortalShareText,
  buildWhatsAppShareUrl,
  describeClientContact,
} from "@/lib/domain/clients";
import { notify } from "@/lib/notify";
import { plural } from "@/lib/text";
import type { Client } from "@/types/domain";

interface ClientCardProps {
  client: Client;
  machineCount: number;
  onEdit: () => void;
  onToggleAccess: () => void;
  onRemove: () => void;
}

export function ClientCard({
  client,
  machineCount,
  onEdit,
  onToggleAccess,
  onRemove,
}: ClientCardProps) {
  const copyAccess = () => {
    navigator.clipboard.writeText(buildPortalShareText(client.access_code)).catch(() => undefined);
    notify.success("Enlace y código copiados");
  };

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold">{client.name}</h3>
          <p className="mt-0.5 text-sm text-ink-muted">{describeClientContact(client)}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
            <Truck className="size-4 text-ink-muted" aria-hidden="true" />
            {machineCount} {plural(machineCount, "máquina")} {plural(machineCount, "asignada")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-md bg-brand-soft px-2.5 py-1 font-mono text-lg font-bold tracking-wider text-brand-strong">
            {client.access_code}
          </span>
          <Badge tone={client.active ? "success" : "danger"}>
            {client.active ? "Acceso activo" : "Acceso desactivado"}
          </Badge>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button variant="secondary" size="sm" onClick={copyAccess}>
          <Copy aria-hidden="true" />
          Copiar enlace y código
        </Button>
        <a
          className={buttonClassName({ variant: "secondary", size: "sm" })}
          href={buildWhatsAppShareUrl(client.access_code)}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle aria-hidden="true" />
          Enviar por WhatsApp
        </a>
        <Button variant="secondary" size="sm" onClick={onToggleAccess}>
          {client.active ? <Ban aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
          {client.active ? "Desactivar acceso" : "Activar acceso"}
        </Button>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          <Pencil aria-hidden="true" />
          Editar
        </Button>
        <Button variant="danger-soft" size="sm" onClick={onRemove}>
          <Trash2 aria-hidden="true" />
          Eliminar
        </Button>
      </div>
    </Card>
  );
}
