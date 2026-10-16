CREATE TABLE public.guest_waiver_requests (
  id text PRIMARY KEY,
  full_name text NOT NULL,
  national_id text NOT NULL,
  phone text NOT NULL,
  email text,
  region text NOT NULL,
  city text NOT NULL,
  age integer NOT NULL,
  job_status text NOT NULL,
  bank text NOT NULL,
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.guest_waiver_requests TO authenticated;
GRANT ALL ON public.guest_waiver_requests TO service_role;
ALTER TABLE public.guest_waiver_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read guest waivers" ON public.guest_waiver_requests FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins update guest waivers" ON public.guest_waiver_requests FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE INDEX guest_waiver_phone_idx ON public.guest_waiver_requests (phone, created_at DESC);