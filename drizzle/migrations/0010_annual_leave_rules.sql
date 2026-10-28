ALTER TABLE public.hr_employees ALTER COLUMN leave_entitlement SET DEFAULT 11;
CREATE OR REPLACE FUNCTION public.hr_ensure_self_employee() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e uuid; p record; BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
SELECT id INTO e FROM hr_employees WHERE user_id=auth.uid(); IF e IS NOT NULL THEN RETURN e; END IF;
SELECT * INTO p FROM profiles WHERE user_id=auth.uid() AND is_active; IF p IS NULL THEN RAISE EXCEPTION 'An active staff account is required'; END IF;
INSERT INTO hr_employees(user_id,full_name,email,phone,department,job_title,start_date,leave_entitlement)
VALUES(auth.uid(),p.full_name,p.email,p.phone,p.department::text,'Staff',(p.created_at AT TIME ZONE 'Africa/Accra')::date,11)
ON CONFLICT (user_id) DO NOTHING RETURNING id INTO e;
IF e IS NULL THEN SELECT id INTO e FROM hr_employees WHERE user_id=auth.uid(); END IF;
RETURN e; END $$;
CREATE OR REPLACE FUNCTION public.hr_annual_leave_max_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
IF NEW.leave_type='annual' AND NEW.days > 4 THEN RAISE EXCEPTION 'Annual leave can be taken for at most 4 working days at a time'; END IF;
RETURN NEW; END $$;
CREATE TRIGGER hr_annual_leave_max_guard BEFORE INSERT OR UPDATE OF days, leave_type ON public.hr_leave_requests FOR EACH ROW EXECUTE FUNCTION public.hr_annual_leave_max_guard();