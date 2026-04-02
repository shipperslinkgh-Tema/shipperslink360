
-- 1. Make chat-attachments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'chat-attachments';

-- 2. Drop overly permissive storage SELECT policy on chat-attachments
DROP POLICY IF EXISTS "Chat attachments are publicly accessible" ON storage.objects;

-- Create authenticated-only policy for chat-attachments
CREATE POLICY "Authenticated users can view chat attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-attachments');

-- 3. Create a security-definer function to check operations/admin roles for OTP access
CREATE OR REPLACE FUNCTION public.can_view_delivery_otp(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin', 'admin'))
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _user_id AND department IN ('operations', 'warehouse', 'management'))
  )
$$;

-- 4. Restrict workflow_notifications to target user or department
DROP POLICY IF EXISTS "Staff can view workflow notifications" ON public.workflow_notifications;

CREATE POLICY "Staff can view own workflow notifications"
ON public.workflow_notifications FOR SELECT
USING (
  is_admin(auth.uid())
  OR target_user_id = auth.uid()
  OR target_department = (SELECT department::text FROM public.profiles WHERE user_id = auth.uid())
);
