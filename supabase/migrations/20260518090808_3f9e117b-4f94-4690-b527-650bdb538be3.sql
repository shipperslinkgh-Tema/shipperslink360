DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'trucking_trips','customers','drivers','trucks',
    'completed_consignments','finance_expenses','ledger_entries',
    'vouchers','voucher_lines','consignment_audit_logs','consignment_documents',
    'client_documents','client_payments'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t)
       AND NOT EXISTS (
         SELECT 1 FROM pg_publication_tables
         WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t
       ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
    END IF;
  END LOOP;
END $$;