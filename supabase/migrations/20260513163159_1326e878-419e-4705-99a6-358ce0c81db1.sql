
REVOKE EXECUTE ON FUNCTION public.notify_client(text,text,text,text,text,text,text,text,text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_notify_client_invoice_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_notify_client_invoice_paid() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_notify_client_shipment_status() FROM PUBLIC, anon, authenticated;
