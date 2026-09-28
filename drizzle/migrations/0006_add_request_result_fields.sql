ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS actual_amount numeric,
  ADD COLUMN IF NOT EXISTS result_recorded_at timestamptz,
  ADD COLUMN IF NOT EXISTS result_recorded_by text;

COMMENT ON COLUMN public.requests.actual_amount IS 'المبلغ الفعلي بعد نجاح الطلب (معفى/مجدول/مُتاح) - يسجله المسؤول فقط';

CREATE OR REPLACE FUNCTION public.guard_request_result()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN RETURN NEW; END IF;
  IF NEW.actual_amount IS DISTINCT FROM OLD.actual_amount
     OR NEW.result_recorded_at IS DISTINCT FROM OLD.result_recorded_at
     OR NEW.result_recorded_by IS DISTINCT FROM OLD.result_recorded_by
     OR NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_request_result ON public.requests;
CREATE TRIGGER guard_request_result
BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.guard_request_result();