ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS summary jsonb;

CREATE OR REPLACE FUNCTION public.inspections_set_summary()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.summary := (NEW.data - 'photos'::text)
    || jsonb_build_object('photoCount', coalesce(jsonb_array_length(NEW.data -> 'photos'), 0));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inspections_summary_trg ON public.inspections;
CREATE TRIGGER inspections_summary_trg
BEFORE INSERT OR UPDATE OF data ON public.inspections
FOR EACH ROW EXECUTE FUNCTION public.inspections_set_summary();

UPDATE public.inspections
SET summary = (data - 'photos'::text)
  || jsonb_build_object('photoCount', coalesce(jsonb_array_length(data -> 'photos'), 0))
WHERE summary IS NULL;

CREATE INDEX IF NOT EXISTS inspections_created_at_idx ON public.inspections (created_at DESC);