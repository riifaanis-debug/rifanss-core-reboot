CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE TABLE public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  entity_id text NOT NULL,
  recipient_role text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error text,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  locked_at timestamptz,
  UNIQUE (event, entity_id, recipient_role)
);
GRANT ALL ON public.email_events TO service_role;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX email_events_pending_idx ON public.email_events (status, created_at);

CREATE OR REPLACE FUNCTION public.email_dispatch_kick()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://rifanss.com/api/public/email-dispatch',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.enqueue_email(p_event text, p_entity text, p_roles text[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r text; n int := 0; c int;
BEGIN
  FOREACH r IN ARRAY p_roles LOOP
    INSERT INTO public.email_events (event, entity_id, recipient_role)
    VALUES (p_event, p_entity, r) ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS c = ROW_COUNT; n := n + c;
  END LOOP;
  IF n > 0 THEN PERFORM public.email_dispatch_kick(); END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.trg_email_requests()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.enqueue_email('request_created', NEW.id, ARRAY['customer','admin']);
  ELSIF NEW.status IS DISTINCT FROM OLD.status
        AND NEW.status IN ('under_review','processing','awaiting_documents','approved','rejected','completed') THEN
    PERFORM public.enqueue_email('request_status_' || NEW.status,
      NEW.id || ':' || (SELECT count(*) FROM public.email_events WHERE event = 'request_status_' || NEW.status AND entity_id LIKE NEW.id || ':%'),
      ARRAY['customer']);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER email_requests AFTER INSERT OR UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.trg_email_requests();

CREATE OR REPLACE FUNCTION public.trg_email_contracts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.enqueue_email('contract_issued', NEW.id, ARRAY['customer']);
    IF NEW.signed_at IS NOT NULL THEN PERFORM public.enqueue_email('contract_signed', NEW.id, ARRAY['admin']); END IF;
  ELSIF OLD.signed_at IS NULL AND NEW.signed_at IS NOT NULL THEN
    PERFORM public.enqueue_email('contract_signed', NEW.id, ARRAY['admin']);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER email_contracts AFTER INSERT OR UPDATE ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.trg_email_contracts();

CREATE OR REPLACE FUNCTION public.trg_email_notes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.enqueue_email('promissory_issued', NEW.id, ARRAY['customer']);
  ELSIF OLD.signed_at IS NULL AND NEW.signed_at IS NOT NULL THEN
    PERFORM public.enqueue_email('promissory_signed', NEW.id, ARRAY['admin']);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER email_notes AFTER INSERT OR UPDATE ON public.promissory_notes
FOR EACH ROW EXECUTE FUNCTION public.trg_email_notes();

CREATE OR REPLACE FUNCTION public.trg_email_invoices()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.enqueue_email('invoice_issued', NEW.id, ARRAY['customer']);
  RETURN NEW;
END $$;
CREATE TRIGGER email_invoices AFTER INSERT ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.trg_email_invoices();

CREATE OR REPLACE FUNCTION public.trg_email_open_requests()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.submitted_at IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.submitted_at IS DISTINCT FROM NEW.submitted_at) THEN
    PERFORM public.enqueue_email('documents_submitted', NEW.id || ':' || extract(epoch from NEW.submitted_at)::bigint, ARRAY['admin']);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER email_open_requests AFTER INSERT OR UPDATE ON public.open_requests
FOR EACH ROW EXECUTE FUNCTION public.trg_email_open_requests();

CREATE OR REPLACE FUNCTION public.trg_email_app_users()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF COALESCE(NEW.role,'') <> 'admin'
     AND COALESCE(NEW.full_name,'') <> '' AND COALESCE(NEW.phone,'') <> ''
     AND COALESCE(NEW.national_id,'') <> '' AND COALESCE(NEW.email,'') <> ''
     AND NEW.auth_user_id IS NOT NULL THEN
    PERFORM public.enqueue_email('customer_registered', NEW.id, ARRAY['customer','admin']);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER email_app_users AFTER INSERT OR UPDATE ON public.app_users
FOR EACH ROW EXECUTE FUNCTION public.trg_email_app_users();

REVOKE EXECUTE ON FUNCTION public.enqueue_email(text,text,text[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_dispatch_kick() FROM PUBLIC, anon, authenticated;

-- Hourly retry backstop only; every event wakes the sender immediately.
SELECT cron.schedule('rifans-email-retry', '0 * * * *', $$SELECT public.email_dispatch_kick() WHERE EXISTS (SELECT 1 FROM public.email_events WHERE status IN ('pending','failed') AND attempts < 5)$$);