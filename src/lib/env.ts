import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.url({ error: "VITE_SUPABASE_URL debe ser una URL válida" }),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "Falta VITE_SUPABASE_PUBLISHABLE_KEY"),
});

export type Env = z.infer<typeof envSchema>;

function readEnv(): Env {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    const details = result.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Configuración incompleta: ${details}. Revisa el archivo .env.`);
  }
  return result.data;
}

export const env = readEnv();
