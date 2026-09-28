ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS doc_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS replaced_by text,
  ADD COLUMN IF NOT EXISTS voided_at timestamptz,
  ADD COLUMN IF NOT EXISTS voided_by text,
  ADD COLUMN IF NOT EXISTS void_reason text,
  ADD COLUMN IF NOT EXISTS actual_amount numeric,
  ADD COLUMN IF NOT EXISTS seized_amount numeric,
  ADD COLUMN IF NOT EXISTS current_account_number text,
  ADD COLUMN IF NOT EXISTS bank text;

ALTER TABLE public.promissory_notes
  ADD COLUMN IF NOT EXISTS doc_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS replaced_by text,
  ADD COLUMN IF NOT EXISTS voided_at timestamptz,
  ADD COLUMN IF NOT EXISTS voided_by text,
  ADD COLUMN IF NOT EXISTS void_reason text;

ALTER TABLE public.promissory_notes ALTER COLUMN issue_city SET DEFAULT 'جدة';
ALTER TABLE public.promissory_notes ALTER COLUMN payment_city SET DEFAULT 'جدة';

CREATE UNIQUE INDEX IF NOT EXISTS invoices_one_active_per_request
  ON public.invoices (submission_id) WHERE doc_status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS promissory_notes_one_active_per_request
  ON public.promissory_notes (submission_id) WHERE doc_status = 'active';

CREATE OR REPLACE FUNCTION public.validate_doc_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.doc_status NOT IN ('active','voided','replaced') THEN
    RAISE EXCEPTION 'invalid doc_status';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.freeze_issued_invoice()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.submission_id IS DISTINCT FROM OLD.submission_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.type IS DISTINCT FROM OLD.type
     OR NEW.amount IS DISTINCT FROM OLD.amount OR NEW.percentage IS DISTINCT FROM OLD.percentage
     OR NEW.total_debt IS DISTINCT FROM OLD.total_debt OR NEW.actual_amount IS DISTINCT FROM OLD.actual_amount
     OR NEW.seized_amount IS DISTINCT FROM OLD.seized_amount
     OR NEW.current_account_number IS DISTINCT FROM OLD.current_account_number
     OR NEW.bank IS DISTINCT FROM OLD.bank OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'issued invoice content cannot be changed; issue a replacement instead';
  END IF;
  IF OLD.doc_status <> 'active' AND NEW.doc_status IS DISTINCT FROM OLD.doc_status THEN
    RAISE EXCEPTION 'voided or replaced invoice cannot be reactivated';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.freeze_issued_note()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.submission_id IS DISTINCT FROM OLD.submission_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.contract_id IS DISTINCT FROM OLD.contract_id
     OR NEW.amount IS DISTINCT FROM OLD.amount OR NEW.amount_in_words IS DISTINCT FROM OLD.amount_in_words
     OR NEW.debtor_name IS DISTINCT FROM OLD.debtor_name OR NEW.debtor_national_id IS DISTINCT FROM OLD.debtor_national_id
     OR NEW.issue_city IS DISTINCT FROM OLD.issue_city OR NEW.payment_city IS DISTINCT FROM OLD.payment_city
     OR NEW.due_date IS DISTINCT FROM OLD.due_date OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'issued note content cannot be changed; issue a replacement instead';
  END IF;
  IF OLD.signed_at IS NOT NULL AND (NEW.signature_data IS DISTINCT FROM OLD.signature_data OR NEW.signed_at IS DISTINCT FROM OLD.signed_at) THEN
    RAISE EXCEPTION 'signed note cannot be changed';
  END IF;
  IF OLD.doc_status <> 'active' AND NEW.doc_status IS DISTINCT FROM OLD.doc_status THEN
    RAISE EXCEPTION 'voided or replaced note cannot be reactivated';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER invoices_validate_doc_status BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.validate_doc_status();
CREATE TRIGGER notes_validate_doc_status BEFORE INSERT OR UPDATE ON public.promissory_notes
  FOR EACH ROW EXECUTE FUNCTION public.validate_doc_status();
CREATE TRIGGER invoices_freeze_issued BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.freeze_issued_invoice();
CREATE TRIGGER notes_freeze_issued BEFORE UPDATE ON public.promissory_notes
  FOR EACH ROW EXECUTE FUNCTION public.freeze_issued_note();