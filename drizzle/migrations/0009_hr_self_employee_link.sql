CREATE OR REPLACE FUNCTION public.hr_ensure_self_employee() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e uuid; p record; BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
SELECT id INTO e FROM hr_employees WHERE user_id=auth.uid(); IF e IS NOT NULL THEN RETURN e; END IF;
SELECT * INTO p FROM profiles WHERE user_id=auth.uid() AND is_active; IF p IS NULL THEN RAISE EXCEPTION 'An active staff account is required'; END IF;
INSERT INTO hr_employees(user_id,full_name,email,phone,department,job_title,start_date,leave_entitlement)
VALUES(auth.uid(),p.full_name,p.email,p.phone,p.department::text,'Staff',(p.created_at AT TIME ZONE 'Africa/Accra')::date,0)
ON CONFLICT (user_id) DO NOTHING RETURNING id INTO e;
IF e IS NULL THEN SELECT id INTO e FROM hr_employees WHERE user_id=auth.uid(); END IF;
RETURN e; END $$;
REVOKE ALL ON FUNCTION public.hr_ensure_self_employee() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hr_ensure_self_employee() TO authenticated;