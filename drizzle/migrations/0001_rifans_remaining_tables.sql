CREATE TABLE public.client_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.webauthn_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports JSONB DEFAULT '[]'::jsonb,
  device_name TEXT,
  device_type TEXT,
  backed_up BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_webauthn_creds_user_id ON public.webauthn_credentials(user_id);
CREATE INDEX idx_webauthn_creds_cred_id ON public.webauthn_credentials(credential_id);

CREATE TABLE public.webauthn_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge TEXT NOT NULL,
  user_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('registration', 'authentication')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_webauthn_challenges_challenge ON public.webauthn_challenges(challenge);
CREATE INDEX idx_webauthn_challenges_expires ON public.webauthn_challenges(expires_at);

CREATE TABLE public.payment_requests (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  client_name text,
  amount_sar numeric NOT NULL DEFAULT 0,
  amount_usd numeric NOT NULL DEFAULT 0,
  exchange_rate numeric NOT NULL DEFAULT 3.75,
  description text,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX idx_payment_requests_user_id ON public.payment_requests(user_id);
CREATE INDEX idx_payment_requests_created_at ON public.payment_requests(created_at DESC);

CREATE TABLE public.open_requests (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  title text NOT NULL,
  description text,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb DEFAULT '{}'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_open_requests_user ON public.open_requests(user_id);
CREATE INDEX idx_open_requests_status ON public.open_requests(status);

CREATE TABLE public.promissory_notes (
  id text NOT NULL PRIMARY KEY,
  submission_id text NOT NULL,
  user_id text NOT NULL,
  contract_id text,
  amount numeric NOT NULL DEFAULT 0,
  amount_in_words text,
  debtor_name text,
  debtor_national_id text,
  issue_city text NOT NULL DEFAULT 'جدة - المملكة العربية السعودية',
  payment_city text NOT NULL DEFAULT 'جدة - المملكة العربية السعودية',
  due_date text NOT NULL DEFAULT 'لدى الإطلاع',
  signature_data text,
  signed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX idx_promissory_notes_user ON public.promissory_notes(user_id);
CREATE INDEX idx_promissory_notes_submission ON public.promissory_notes(submission_id);

CREATE TABLE public.email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_email_send_log_created ON public.email_send_log(created_at DESC);
CREATE INDEX idx_email_send_log_recipient ON public.email_send_log(recipient_email);
CREATE INDEX idx_email_send_log_message ON public.email_send_log(message_id);
CREATE UNIQUE INDEX idx_email_send_log_message_sent_unique ON public.email_send_log(message_id) WHERE status = 'sent';

CREATE TABLE public.email_send_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  retry_after_until TIMESTAMPTZ,
  batch_size INTEGER NOT NULL DEFAULT 10,
  send_delay_ms INTEGER NOT NULL DEFAULT 200,
  auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15,
  transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.suppressed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribe', 'bounce', 'complaint')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email)
);
CREATE INDEX idx_suppressed_emails_email ON public.suppressed_emails(email);

CREATE TABLE public.email_unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);
CREATE INDEX idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens(token);

GRANT SELECT ON public.client_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_reviews TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.webauthn_credentials TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.webauthn_challenges TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payment_requests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.open_requests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.promissory_notes TO anon, authenticated;
GRANT ALL ON public.client_reviews, public.webauthn_credentials, public.webauthn_challenges, public.payment_requests, public.open_requests, public.promissory_notes, public.email_send_log, public.email_send_state, public.suppressed_emails, public.email_unsubscribe_tokens TO service_role;

ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promissory_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published reviews" ON public.client_reviews FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated users can insert reviews" ON public.client_reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update reviews" ON public.client_reviews FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete reviews" ON public.client_reviews FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read their own credentials" ON public.webauthn_credentials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert their own credentials" ON public.webauthn_credentials FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can delete their own credentials" ON public.webauthn_credentials FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "Service role full access on webauthn_credentials" ON public.webauthn_credentials FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on webauthn_challenges" ON public.webauthn_challenges FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can insert challenges" ON public.webauthn_challenges FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read challenges" ON public.webauthn_challenges FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete expired challenges" ON public.webauthn_challenges FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Users can read payment_requests" ON public.payment_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert payment_requests" ON public.payment_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update payment_requests" ON public.payment_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Deny delete on payment_requests" ON public.payment_requests FOR DELETE TO public USING (false);
CREATE POLICY "Service role full access on payment_requests" ON public.payment_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can read open_requests" ON public.open_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert open_requests" ON public.open_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update open_requests" ON public.open_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Deny delete on open_requests" ON public.open_requests FOR DELETE TO public USING (false);
CREATE POLICY "Service role full access on open_requests" ON public.open_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can read promissory_notes" ON public.promissory_notes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can insert promissory_notes" ON public.promissory_notes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can update promissory_notes" ON public.promissory_notes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Deny delete on promissory_notes" ON public.promissory_notes FOR DELETE TO public USING (false);
CREATE POLICY "Service role full access on promissory_notes" ON public.promissory_notes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can read send log" ON public.email_send_log FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Service role can insert send log" ON public.email_send_log FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update send log" ON public.email_send_log FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage send state" ON public.email_send_state FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can read suppressed emails" ON public.suppressed_emails FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Service role can insert suppressed emails" ON public.suppressed_emails FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can read tokens" ON public.email_unsubscribe_tokens FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Service role can insert tokens" ON public.email_unsubscribe_tokens FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can mark tokens as used" ON public.email_unsubscribe_tokens FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');