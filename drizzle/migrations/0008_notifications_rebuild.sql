ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS target_type text,
  ADD COLUMN IF NOT EXISTS target_id text,
  ADD COLUMN IF NOT EXISTS event text,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE public.notifications ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.guard_notification_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN RETURN NEW; END IF;
  IF (to_jsonb(NEW) - 'is_read' - 'archived_at') IS DISTINCT FROM (to_jsonb(OLD) - 'is_read' - 'archived_at') THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_notification_update ON public.notifications;
CREATE TRIGGER guard_notification_update BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.guard_notification_update();

CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  submission_id text,
  target_type text,
  target_id text,
  customer_id text REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_notifications_created_idx ON public.admin_notifications (created_at DESC);
GRANT SELECT ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read" ON public.admin_notifications FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE public.admin_notification_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.admin_notifications(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL,
  read_at timestamptz,
  archived_at timestamptz,
  UNIQUE (notification_id, admin_user_id)
);
CREATE INDEX admin_notification_states_admin_idx ON public.admin_notification_states (admin_user_id);
GRANT SELECT, INSERT, UPDATE ON public.admin_notification_states TO authenticated;
GRANT ALL ON public.admin_notification_states TO service_role;
ALTER TABLE public.admin_notification_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own state read" ON public.admin_notification_states FOR SELECT TO authenticated
  USING (public.is_admin() AND admin_user_id = auth.uid());
CREATE POLICY "own state insert" ON public.admin_notification_states FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND admin_user_id = auth.uid());
CREATE POLICY "own state update" ON public.admin_notification_states FOR UPDATE TO authenticated
  USING (public.is_admin() AND admin_user_id = auth.uid())
  WITH CHECK (public.is_admin() AND admin_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.notify_admins(p_event text, p_submission_id text DEFAULT NULL, p_target_id text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me text := public.current_app_user_id();
  cust text; cname text; rtype text; t_type text; t_id text; ttl text; msg text; ref text; new_id uuid;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not allowed'; END IF;
  IF p_submission_id IS NOT NULL THEN
    SELECT user_id, type INTO cust, rtype FROM public.requests WHERE id = p_submission_id;
    IF cust IS NULL THEN
      SELECT user_id, title INTO cust, rtype FROM public.open_requests WHERE id = p_submission_id;
    END IF;
    IF cust IS NULL OR (cust <> me AND NOT public.is_admin()) THEN RAISE EXCEPTION 'not allowed'; END IF;
  ELSE
    cust := me;
  END IF;
  SELECT COALESCE(NULLIF(full_name,''), 'غير محدد') INTO cname FROM public.app_users WHERE id = cust;

  IF p_event = 'request_submitted' THEN
    ttl := 'طلب جديد';
    msg := format('قام العميل %s بتقديم طلب جديد من نوع %s رقم %s.', cname, COALESCE(rtype,''), p_submission_id);
    t_type := 'request'; t_id := p_submission_id;
  ELSIF p_event = 'documents_submitted' THEN
    ttl := 'تم استلام مستندات من العميل';
    msg := format('قام العميل %s بإرسال المستندات/البيانات المطلوبة للطلب رقم %s.', cname, p_submission_id);
    t_type := CASE WHEN EXISTS (SELECT 1 FROM public.open_requests WHERE id = p_submission_id) THEN 'open_request' ELSE 'request' END;
    t_id := p_submission_id;
  ELSIF p_event = 'contract_signed' THEN
    SELECT id INTO ref FROM public.contracts WHERE submission_id = p_submission_id AND user_id = cust ORDER BY created_at DESC LIMIT 1;
    ttl := 'تم توقيع العقد';
    msg := format('قام العميل %s بتوقيع العقد رقم %s.', cname, COALESCE(ref, p_submission_id));
    t_type := 'contract'; t_id := COALESCE(ref, p_submission_id);
  ELSIF p_event = 'note_signed' THEN
    SELECT id INTO ref FROM public.promissory_notes WHERE submission_id = p_submission_id AND user_id = cust AND doc_status = 'active' LIMIT 1;
    ttl := 'تم توقيع السند لأمر';
    msg := format('قام العميل %s بتوقيع السند لأمر رقم %s.', cname, COALESCE(ref, p_submission_id));
    t_type := 'promissory_note'; t_id := COALESCE(ref, p_submission_id);
  ELSIF p_event = 'customer_registered' THEN
    ttl := 'عميل جديد';
    msg := format('أكمل العميل %s بياناته الأساسية.', cname);
    t_type := 'customer'; t_id := cust;
  ELSE
    RAISE EXCEPTION 'unknown event';
  END IF;

  INSERT INTO public.admin_notifications (event, title, message, submission_id, target_type, target_id, customer_id)
  VALUES (p_event, ttl, msg, p_submission_id, t_type, t_id, cust) RETURNING id INTO new_id;
  RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.notify_admins(text, text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.notify_admins(text, text, text) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notification_states;