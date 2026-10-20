import { BRAND_NAME, CLIENT_PORTAL_PATH } from "@/constants/brand";
import { createId } from "@/lib/ids";
import type { Client } from "@/types/domain";
import type { ClientFormValues } from "@/lib/validation";

export function getPortalUrl(origin: string = window.location.origin): string {
  return `${origin}${CLIENT_PORTAL_PATH}`;
}

export function buildPortalShareText(accessCode: string, portalUrl = getPortalUrl()): string {
  return `Portal ${BRAND_NAME}: ${portalUrl}\nTu código de acceso: ${accessCode}`;
}

export function buildWhatsAppShareUrl(accessCode: string, portalUrl = getPortalUrl()): string {
  const message = `Portal ${BRAND_NAME}: ${portalUrl} — Tu código de acceso: ${accessCode}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function describeClientContact(client: Client): string {
  const parts = [client.cif, client.contact, client.phone, client.email, client.site].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(" · ") : "Sin datos de contacto";
}

export type NewClient = Omit<Client, "created_at">;

export function buildNewClient(values: ClientFormValues): NewClient {
  return {
    id: createId.client(),
    ...values,
    access_code: createId.accessCode(),
    active: true,
  };
}
