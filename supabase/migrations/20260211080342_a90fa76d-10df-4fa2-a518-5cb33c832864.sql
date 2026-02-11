
-- Fix permissive audit_logs insert policy - restrict to authenticated users inserting their own logs
DROP POLICY "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
