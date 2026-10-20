import { supabase } from "@/lib/supabase";
import { toSafeFileName } from "@/lib/text";
import type { MachineDocument } from "@/types/domain";

import { assertOk, unwrap } from "./result";

const BUCKET = "machine-docs";
const SIGNED_URL_TTL_SECONDS = 3600;

/** Sube un documento de máquina al almacenamiento y devuelve su descripción. */
export async function uploadMachineDocument(
  machineId: string,
  file: File,
): Promise<MachineDocument> {
  const path = `${machineId}/${Date.now()}_${toSafeFileName(file.name)}`;
  assertOk(
    await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type || "application/octet-stream" }),
    "No se pudo subir el documento",
  );
  return { name: file.name, path, uploadedAt: new Date().toISOString(), size: file.size };
}

export async function getMachineDocumentUrl(path: string): Promise<string> {
  const data = unwrap(
    await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS),
    "Error al abrir documento",
  );
  return data.signedUrl;
}

export async function removeMachineDocument(path: string): Promise<void> {
  assertOk(await supabase.storage.from(BUCKET).remove([path]), "Error al eliminar documento");
}
