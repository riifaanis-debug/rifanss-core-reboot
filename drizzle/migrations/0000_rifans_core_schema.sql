CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.app_users (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  email TEXT,
  password_hash TEXT,
  phone TEXT,
  national_id TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  file_number TEXT,
  job_status TEXT,
  salary NUMERIC,
  age TEXT,
  region TEXT,
  city TEXT,
  bank TEXT,
  service_type TEXT,
  products JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_app_users_email ON public.app_users(email) WHERE email IS NOT NULL AND email != '';
CREATE INDEX idx_app_users_national_id ON public.app_users(national_id);

CREATE TABLE public.requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'general',
  details TEXT DEFAULT '',
  data JSONB DEFAULT '{}'::jsonb,
  files JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_requests_user_id ON public.requests(user_id);
CREATE INDEX idx_requests_status ON public.requests(status);

CREATE TABLE public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  submission_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

CREATE TABLE public.contracts (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  type TEXT,
  signature_data TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX idx_contracts_submission_id ON public.contracts(submission_id);

CREATE TABLE public.request_history (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  comment TEXT,
  changed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_request_history_request_id ON public.request_history(request_id);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  attachment_url TEXT,
  attachment_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  user_id text REFERENCES public.app_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.invoices (
  id text NOT NULL PRIMARY KEY,
  submission_id text NOT NULL,
  user_id text NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  type text DEFAULT 'general',
  amount numeric DEFAULT 0,
  percentage numeric DEFAULT 0,
  total_debt numeric DEFAULT 0,
  notes text,
  status text DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.verify_password(input_password text, stored_hash text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
  SELECT stored_hash = extensions.crypt(input_password, stored_hash);
$$;

CREATE OR REPLACE VIEW public.app_users_safe AS
SELECT id, full_name, first_name, middle_name, last_name, email, phone, national_id, role,
       salary, products, documents, region, city, bank, service_type, file_number, job_status, age,
       created_at, updated_at
FROM public.app_users;

GRANT SELECT, INSERT, UPDATE ON public.app_users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.requests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.contracts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.request_history TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.chat_messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.invoices TO anon, authenticated;
GRANT SELECT ON public.app_users_safe TO anon, authenticated;
GRANT ALL ON public.app_users, public.requests, public.notifications, public.contracts, public.request_history, public.chat_messages, public.otp_codes, public.invoices TO service_role;
GRANT SELECT ON public.app_users_safe TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_password(text, text) TO anon, authenticated, service_role;

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny delete on app_users" ON public.app_users FOR DELETE TO public USING (false);
CREATE POLICY "Deny delete on contracts" ON public.contracts FOR DELETE TO public USING (false);
CREATE POLICY "Deny delete on notifications" ON public.notifications FOR DELETE TO public USING (false);
CREATE POLICY "Deny delete on request_history" ON public.request_history FOR DELETE TO public USING (false);
CREATE POLICY "Deny delete on requests" ON public.requests FOR DELETE TO public USING (false);
CREATE POLICY "Deny delete on invoices" ON public.invoices FOR DELETE USING (false);

CREATE POLICY "Service role full access on app_users" ON public.app_users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can read own profile" ON public.app_users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.app_users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.app_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on requests" ON public.requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can read requests" ON public.requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert requests" ON public.requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update requests" ON public.requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on contracts" ON public.contracts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can read contracts" ON public.contracts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert contracts" ON public.contracts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update contracts" ON public.contracts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on notifications" ON public.notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can read notifications" ON public.notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on request_history" ON public.request_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can read request_history" ON public.request_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert request_history" ON public.request_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update request_history" ON public.request_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can read their own messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can insert messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update read status" ON public.chat_messages FOR UPDATE USING (true);

CREATE POLICY "Service role full access on otp_codes" ON public.otp_codes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on invoices" ON public.invoices FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can insert invoices" ON public.invoices FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can read invoices" ON public.invoices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can update invoices" ON public.invoices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;