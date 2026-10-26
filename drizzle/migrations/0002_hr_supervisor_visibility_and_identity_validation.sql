CREATE FUNCTION public.hr_can_review_employee(_employee uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT hr_active_staff() AND EXISTS(SELECT 1 FROM hr_employees e JOIN hr_access a ON a.user_id=e.supervisor_user_id AND a.access_role='supervisor' WHERE e.id=_employee AND e.supervisor_user_id=auth.uid()) $$;
REVOKE ALL ON FUNCTION public.hr_can_review_employee(uuid) FROM PUBLIC, anon; GRANT EXECUTE ON FUNCTION public.hr_can_review_employee(uuid) TO authenticated;
CREATE POLICY hr_supervisor_leave_read ON public.hr_leave_requests FOR SELECT TO authenticated USING(hr_can_review_employee(employee_id));
CREATE FUNCTION public.hr_employee_identity_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF TG_OP='UPDATE' THEN
IF NEW.id IS DISTINCT FROM OLD.id OR NEW.staff_id IS DISTINCT FROM OLD.staff_id THEN RAISE EXCEPTION 'Employee and Staff IDs cannot be changed'; END IF;
IF NEW.user_id IS DISTINCT FROM OLD.user_id AND (EXISTS(SELECT 1 FROM hr_attendance WHERE employee_id=OLD.id) OR EXISTS(SELECT 1 FROM hr_leave_requests WHERE employee_id=OLD.id)) THEN RAISE EXCEPTION 'Cannot reassign a linked account with HR history'; END IF;
END IF;
IF length(NEW.full_name)>200 OR length(NEW.job_title)>200 THEN RAISE EXCEPTION 'Name and job title must be 200 characters or fewer'; END IF;
RETURN NEW; END $$;
CREATE TRIGGER hr_employee_identity_guard BEFORE INSERT OR UPDATE ON public.hr_employees FOR EACH ROW EXECUTE FUNCTION public.hr_employee_identity_guard();
CREATE FUNCTION public.hr_leave_input_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
IF NEW.end_date-NEW.start_date>366 OR length(NEW.reason)>2000 OR length(coalesce(NEW.review_note,''))>2000 THEN RAISE EXCEPTION 'Leave must be at most 366 days and notes at most 2000 characters'; END IF;
RETURN NEW; END $$;
CREATE TRIGGER hr_leave_input_guard BEFORE INSERT OR UPDATE ON public.hr_leave_requests FOR EACH ROW EXECUTE FUNCTION public.hr_leave_input_guard();