ALTER TABLE public.otp_codes ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;
ALTER TABLE public.otp_codes ADD COLUMN IF NOT EXISTS purpose text NOT NULL DEFAULT 'register';