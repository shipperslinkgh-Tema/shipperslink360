
-- Create chat_messages table for internal team messaging
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'general',
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_department TEXT,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  consolidation_ref TEXT,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Staff can view all chat messages
CREATE POLICY "Staff can view chat messages"
  ON public.chat_messages FOR SELECT
  TO public
  USING (NOT is_client(auth.uid()));

-- Staff can send chat messages
CREATE POLICY "Staff can send chat messages"
  ON public.chat_messages FOR INSERT
  TO public
  WITH CHECK (NOT is_client(auth.uid()) AND sender_id = auth.uid());

-- Users can edit their own messages
CREATE POLICY "Users can edit own messages"
  ON public.chat_messages FOR UPDATE
  TO public
  USING (sender_id = auth.uid());

-- Admins can delete messages
CREATE POLICY "Admins can delete chat messages"
  ON public.chat_messages FOR DELETE
  TO public
  USING (is_admin(auth.uid()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Index for channel + time queries
CREATE INDEX idx_chat_messages_channel_created ON public.chat_messages (channel, created_at DESC);
CREATE INDEX idx_chat_messages_sender ON public.chat_messages (sender_id);
