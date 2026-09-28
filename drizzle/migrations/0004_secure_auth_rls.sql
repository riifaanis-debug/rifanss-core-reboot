-- 1. Link app_users to auth users
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE;

-- 2. Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin')
$$;

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.app_users WHERE auth_user_id = auth.uid() AND auth.uid() IS NOT NULL LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_admin_app_id(_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.app_users WHERE id = _id AND role = 'admin')
$$;

CREATE OR REPLACE FUNCTION public.owns_request(_request_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.requests WHERE id = _request_id AND user_id = public.current_app_user_id())
$$;

REVOKE EXECUTE ON FUNCTION public.verify_password(text, text) FROM anon, authenticated, public;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- 3. Drop every existing policy on public tables
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename <> 'user_roles' LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 4. Least-privilege grants
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON public.client_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.app_users, public.requests, public.request_history, public.notifications,
  public.contracts, public.invoices, public.promissory_notes, public.payment_requests,
  public.open_requests, public.chat_messages, public.client_reviews
  TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
-- internal tables (otp_codes, email_*, suppressed_emails, webauthn_*) and app_users_safe: server only

-- 5. Guard sensitive columns
CREATE OR REPLACE FUNCTION public.guard_app_users()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN RETURN NEW; END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.role IS DISTINCT FROM OLD.role
     OR NEW.national_id IS DISTINCT FROM OLD.national_id OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id OR NEW.file_number IS DISTINCT FROM OLD.file_number
     OR NEW.password_hash IS DISTINCT FROM OLD.password_hash OR NEW.phone_verified IS DISTINCT FROM OLD.phone_verified THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_app_users ON public.app_users;
CREATE TRIGGER guard_app_users BEFORE UPDATE ON public.app_users FOR EACH ROW EXECUTE FUNCTION public.guard_app_users();

CREATE OR REPLACE FUNCTION public.guard_signed_docs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o jsonb; n jsonb;
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN RETURN NEW; END IF;
  o := to_jsonb(OLD) - 'signature_data' - 'signed_at' - 'status';
  n := to_jsonb(NEW) - 'signature_data' - 'signed_at' - 'status';
  IF o IS DISTINCT FROM n THEN RAISE EXCEPTION 'not allowed'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_contracts ON public.contracts;
CREATE TRIGGER guard_contracts BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.guard_signed_docs();
DROP TRIGGER IF EXISTS guard_notes ON public.promissory_notes;
CREATE TRIGGER guard_notes BEFORE UPDATE ON public.promissory_notes FOR EACH ROW EXECUTE FUNCTION public.guard_signed_docs();

-- 6. Policies
CREATE POLICY "own or admin read" ON public.app_users FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "own or admin update" ON public.app_users FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_admin()) WITH CHECK (auth_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "admin insert" ON public.app_users FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admin delete" ON public.app_users FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "own or admin read" ON public.requests FOR SELECT TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "own or admin insert" ON public.requests FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "own or admin update" ON public.requests FOR UPDATE TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin())
  WITH CHECK (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "admin delete" ON public.requests FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "own or admin read" ON public.request_history FOR SELECT TO authenticated
  USING (public.owns_request(request_id) OR public.is_admin());
CREATE POLICY "own or admin insert" ON public.request_history FOR INSERT TO authenticated
  WITH CHECK (public.owns_request(request_id) OR public.is_admin());
CREATE POLICY "admin update" ON public.request_history FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "admin delete" ON public.request_history FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "own or admin read" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "own, to admin, or admin insert" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.current_app_user_id() IS NOT NULL AND (user_id = public.current_app_user_id() OR public.is_admin_app_id(user_id) OR public.is_admin()));
CREATE POLICY "own or admin update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin())
  WITH CHECK (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "admin delete" ON public.notifications FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "own or admin read" ON public.contracts FOR SELECT TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "own or admin insert" ON public.contracts FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "own or admin update" ON public.contracts FOR UPDATE TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin())
  WITH CHECK (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "admin delete" ON public.contracts FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "own or admin read" ON public.promissory_notes FOR SELECT TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "admin insert" ON public.promissory_notes FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "own or admin update" ON public.promissory_notes FOR UPDATE TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin())
  WITH CHECK (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "admin delete" ON public.promissory_notes FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "own or admin read" ON public.invoices FOR SELECT TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "admin insert" ON public.invoices FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admin update" ON public.invoices FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "admin delete" ON public.invoices FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "own or admin read" ON public.payment_requests FOR SELECT TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "admin insert" ON public.payment_requests FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admin update" ON public.payment_requests FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "admin delete" ON public.payment_requests FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "own or admin read" ON public.open_requests FOR SELECT TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "admin insert" ON public.open_requests FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "own or admin update" ON public.open_requests FOR UPDATE TO authenticated
  USING (user_id = public.current_app_user_id() OR public.is_admin())
  WITH CHECK (user_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "admin delete" ON public.open_requests FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "participant or admin read" ON public.chat_messages FOR SELECT TO authenticated
  USING (sender_id = public.current_app_user_id() OR receiver_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "send as self" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR (sender_id = public.current_app_user_id() AND public.is_admin_app_id(receiver_id)));
CREATE POLICY "receiver or admin update" ON public.chat_messages FOR UPDATE TO authenticated
  USING (receiver_id = public.current_app_user_id() OR public.is_admin());
CREATE POLICY "admin delete" ON public.chat_messages FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "published read" ON public.client_reviews FOR SELECT TO anon, authenticated
  USING (is_published = true OR public.is_admin());
CREATE POLICY "signed-in insert unpublished" ON public.client_reviews FOR INSERT TO authenticated
  WITH CHECK (public.current_app_user_id() IS NOT NULL AND (is_published = false OR public.is_admin()));
CREATE POLICY "admin update" ON public.client_reviews FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "admin delete" ON public.client_reviews FOR DELETE TO authenticated USING (public.is_admin());

-- 7. Storage: no direct browser access; files go through the server
DROP POLICY IF EXISTS "Anyone can view uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload files to uploads" ON storage.objects;