-- Portal de cliente: fichas de cliente y partes diarios de máquina

CREATE TABLE IF NOT EXISTS public.clients (
  id text PRIMARY KEY,
  name text NOT NULL,
  cif text,
  contact text,
  phone text,
  email text,
  site text,
  access_code text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can manage clients" ON public.clients
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can manage clients" ON public.clients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.daily_checks (
  id text PRIMARY KEY,
  client_id text,
  machine_id text NOT NULL,
  check_date date NOT NULL DEFAULT current_date,
  data jsonb NOT NULL,
  summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (machine_id, check_date)
);

CREATE INDEX IF NOT EXISTS daily_checks_check_date_idx ON public.daily_checks (check_date DESC);
CREATE INDEX IF NOT EXISTS daily_checks_client_idx ON public.daily_checks (client_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_checks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_checks TO authenticated;
GRANT ALL ON public.daily_checks TO service_role;

ALTER TABLE public.daily_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can manage daily checks" ON public.daily_checks
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can manage daily checks" ON public.daily_checks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- El resumen (sin fotos) permite listar los partes rápido; las fotos se leen bajo demanda.
CREATE OR REPLACE FUNCTION public.daily_checks_set_summary()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.summary := (NEW.data - 'photos'::text)
    || jsonb_build_object('photoCount', coalesce(jsonb_array_length(NEW.data -> 'photos'), 0));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS daily_checks_summary_trg ON public.daily_checks;
CREATE TRIGGER daily_checks_summary_trg
  BEFORE INSERT OR UPDATE ON public.daily_checks
  FOR EACH ROW EXECUTE FUNCTION public.daily_checks_set_summary();