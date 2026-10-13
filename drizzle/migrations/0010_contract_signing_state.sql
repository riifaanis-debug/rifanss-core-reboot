CREATE OR REPLACE FUNCTION public.lock_signed_contract()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF OLD.signed_at IS NOT NULL AND (NEW.signed_at IS DISTINCT FROM OLD.signed_at OR NEW.signature_data IS DISTINCT FROM OLD.signature_data) THEN
    RAISE EXCEPTION 'contract already signed';
  END IF;
  IF OLD.signed_at IS NULL AND NEW.signed_at IS NOT NULL AND COALESCE(NEW.signature_data,'') = '' THEN
    RAISE EXCEPTION 'signature required';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS lock_signed_contract ON public.contracts;
CREATE TRIGGER lock_signed_contract BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.lock_signed_contract();

CREATE OR REPLACE FUNCTION public.after_contract_signed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF OLD.signed_at IS NULL AND NEW.signed_at IS NOT NULL THEN
    UPDATE public.requests SET status = 'processing' WHERE id = NEW.submission_id AND status = 'contract_signature';
    INSERT INTO public.request_history (id, request_id, status, comment, changed_by)
    VALUES ('H-' || replace(gen_random_uuid()::text,'-',''), NEW.submission_id, 'processing', 'تم توقيع العقد ' || NEW.id || ' من العميل', NEW.user_id);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS after_contract_signed ON public.contracts;
CREATE TRIGGER after_contract_signed AFTER UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.after_contract_signed();

CREATE OR REPLACE FUNCTION public.trg_email_contracts()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.enqueue_email('contract_issued', NEW.id, ARRAY['customer']);
    IF NEW.signed_at IS NOT NULL THEN PERFORM public.enqueue_email('contract_signed', NEW.id, ARRAY['admin','customer']); END IF;
  ELSIF OLD.signed_at IS NULL AND NEW.signed_at IS NOT NULL THEN
    PERFORM public.enqueue_email('contract_signed', NEW.id, ARRAY['admin','customer']);
  END IF;
  RETURN NEW;
END $function$;