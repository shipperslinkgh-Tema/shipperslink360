
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  category text NOT NULL DEFAULT 'system',
  priority text NOT NULL DEFAULT 'medium',
  is_read boolean NOT NULL DEFAULT false,
  is_resolved boolean NOT NULL DEFAULT false,
  read_at timestamp with time zone,
  resolved_at timestamp with time zone,
  recipient_id uuid,
  recipient_department text,
  sender_id uuid,
  reference_id text,
  reference_type text,
  action_url text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view notifications addressed to them or their department
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (
  recipient_id = auth.uid()
  OR recipient_id IS NULL
  OR (recipient_department IS NOT NULL AND recipient_department = get_user_department(auth.uid())::text)
);

-- Users can update (mark read/resolved) their own notifications
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (
  recipient_id = auth.uid()
  OR recipient_id IS NULL
  OR (recipient_department IS NOT NULL AND recipient_department = get_user_department(auth.uid())::text)
);

-- Staff can insert notifications
CREATE POLICY "Staff can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (NOT is_client(auth.uid()));

-- Admins can delete notifications
CREATE POLICY "Admins can delete notifications"
ON public.notifications FOR DELETE
USING (is_admin(auth.uid()));

-- Admins can manage all notifications
CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Seed with sample notifications
INSERT INTO public.notifications (title, message, type, category, priority, recipient_department, reference_type) VALUES
('Demurrage Risk Alert', 'Container MSKU2345678 free days expire in 2 days at Tema Port. Immediate action required.', 'warning', 'operations', 'critical', 'operations', 'container'),
('ICUMS Declaration Pending', 'AWB-7890123 awaiting customs assessment. Officer action required within 24 hours.', 'warning', 'operations', 'high', 'documentation', 'declaration'),
('Invoice INV-2026-0234 Overdue', 'Payment of GHS 45,200 from Goldfields Ghana Ltd is 7 days overdue. Escalation initiated.', 'error', 'finance', 'critical', 'accounts', 'invoice'),
('New Payment Received', 'Payment of GHS 28,500 received from Accra Brewery Ltd for invoice INV-2026-0198.', 'success', 'finance', 'medium', 'accounts', 'payment'),
('Cargo Aging Alert - 14 Days', 'Cargo batch CBN-2026-0045 has been in warehouse for 14 days. Storage charges accumulating.', 'warning', 'warehouse', 'high', 'warehouse', 'cargo'),
('Warehouse Capacity Warning', 'Zone B is at 87% capacity. Consider dispatching pending releases before new arrivals.', 'warning', 'warehouse', 'high', 'warehouse', 'warehouse'),
('Shipment Cleared - BL/COSU8901234', 'Container COSU8901234 has been successfully cleared by ICUMS. Ready for delivery.', 'success', 'operations', 'medium', 'operations', 'shipment'),
('DO Expiring in 3 Days', 'Delivery Order for MSKU1122334 expires January 25. Coordinate immediate trucking dispatch.', 'warning', 'operations', 'high', 'operations', 'delivery_order'),
('Missing Bill of Lading', 'BL document for shipment AWB-2026-0567 has not been received. Client follow-up required.', 'error', 'operations', 'high', 'documentation', 'document'),
('Revenue KPI Below Target', 'Monthly revenue at 78% of target (GHS 378,000 vs GHS 485,000). Management review recommended.', 'warning', 'management', 'critical', 'management', 'kpi'),
('New Client Registered', 'Scancom Ghana Ltd has been registered as a new client. Account setup in progress.', 'info', 'system', 'low', NULL, 'client'),
('System Backup Completed', 'Scheduled daily backup completed successfully at 02:00 AM. All data secured.', 'success', 'system', 'low', NULL, 'system'),
('Cargo Damage Incident', 'Damage reported for cargo lot WH-2026-0089 in Zone A, Rack 3. Incident report filed.', 'error', 'warehouse', 'critical', 'warehouse', 'incident'),
('Payment Method Update', 'MTN MoMo payment gateway integration successfully configured and active.', 'info', 'system', 'low', 'accounts', 'system'),
('Shipment Delayed - Vessel MSC EMMA', 'Vessel MSC EMMA ETA revised from Jan 18 to Jan 24 due to port congestion in Lomé.', 'warning', 'operations', 'high', 'operations', 'shipment');
