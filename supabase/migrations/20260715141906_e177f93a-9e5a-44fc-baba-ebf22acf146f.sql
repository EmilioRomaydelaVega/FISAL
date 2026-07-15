
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_machines TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleet TO anon;

CREATE POLICY "Anon can read custom_machines" ON public.custom_machines FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert custom_machines" ON public.custom_machines FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update custom_machines" ON public.custom_machines FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete custom_machines" ON public.custom_machines FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can manage inspections" ON public.inspections FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage fleet" ON public.fleet FOR ALL TO anon USING (true) WITH CHECK (true);
