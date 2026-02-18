-- Create AI interactions audit log table
CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  department text NOT NULL,
  module text NOT NULL, -- 'operations', 'documentation', 'finance', 'management', 'chat', 'warehouse'
  prompt text NOT NULL,
  response text,
  model text DEFAULT 'google/gemini-3-flash-preview',
  tokens_used integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Staff can insert their own interactions
CREATE POLICY "Users can insert own AI interactions"
ON public.ai_interactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own interactions
CREATE POLICY "Users can view own AI interactions"
ON public.ai_interactions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all AI interactions
CREATE POLICY "Admins can view all AI interactions"
ON public.ai_interactions
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can delete AI interactions
CREATE POLICY "Admins can delete AI interactions"
ON public.ai_interactions
FOR DELETE
USING (is_admin(auth.uid()));