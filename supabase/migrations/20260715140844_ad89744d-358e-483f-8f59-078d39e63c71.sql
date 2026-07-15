
-- Tighten RLS: restrict open policies to authenticated users
DROP POLICY IF EXISTS open_all_fleet ON public.fleet;
DROP POLICY IF EXISTS open_all_inspections ON public.inspections;
DROP POLICY IF EXISTS open_all_custom_machines ON public.custom_machines;

CREATE POLICY "Authenticated users can manage fleet"
  ON public.fleet FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage inspections"
  ON public.inspections FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read machine catalog"
  ON public.custom_machines FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can modify machine catalog"
  ON public.custom_machines FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update machine catalog"
  ON public.custom_machines FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete machine catalog"
  ON public.custom_machines FOR DELETE TO authenticated
  USING (true);

-- Revoke anon grants; ensure authenticated has needed grants
REVOKE ALL ON public.fleet FROM anon;
REVOKE ALL ON public.inspections FROM anon;
REVOKE ALL ON public.custom_machines FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleet TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_machines TO authenticated;

-- Storage policies for 'machine-docs' bucket: authenticated only
DROP POLICY IF EXISTS "Anyone can view machine docs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload machine docs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update machine docs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete machine docs" ON storage.objects;
DROP POLICY IF EXISTS "Public read machine docs" ON storage.objects;
DROP POLICY IF EXISTS "Public write machine docs" ON storage.objects;
DROP POLICY IF EXISTS "Public update machine docs" ON storage.objects;
DROP POLICY IF EXISTS "Public delete machine docs" ON storage.objects;
DROP POLICY IF EXISTS "machine-docs open select" ON storage.objects;
DROP POLICY IF EXISTS "machine-docs open insert" ON storage.objects;
DROP POLICY IF EXISTS "machine-docs open update" ON storage.objects;
DROP POLICY IF EXISTS "machine-docs open delete" ON storage.objects;

CREATE POLICY "machine-docs authenticated read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'machine-docs');

CREATE POLICY "machine-docs authenticated insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'machine-docs');

CREATE POLICY "machine-docs authenticated update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'machine-docs') WITH CHECK (bucket_id = 'machine-docs');

CREATE POLICY "machine-docs authenticated delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'machine-docs');
