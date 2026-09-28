CREATE OR REPLACE FUNCTION public.is_admin_app_id(_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _id = 'admin' OR EXISTS (SELECT 1 FROM public.app_users WHERE id = _id AND role = 'admin')
$$;