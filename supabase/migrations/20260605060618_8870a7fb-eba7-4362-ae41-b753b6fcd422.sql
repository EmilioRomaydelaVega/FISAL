
CREATE TABLE public.inspections (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspections TO anon, authenticated;
GRANT ALL ON public.inspections TO service_role;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_all_inspections" ON public.inspections FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.fleet (
  machine_id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleet TO anon, authenticated;
GRANT ALL ON public.fleet TO service_role;
ALTER TABLE public.fleet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_all_fleet" ON public.fleet FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.custom_machines (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_machines TO anon, authenticated;
GRANT ALL ON public.custom_machines TO service_role;
ALTER TABLE public.custom_machines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_all_custom_machines" ON public.custom_machines FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.inspections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fleet;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_machines;
