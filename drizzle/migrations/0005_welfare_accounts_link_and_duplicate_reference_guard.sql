CREATE UNIQUE INDEX welfare_voucher_reference_unique ON public.vouchers(reference) WHERE reference LIKE 'WELFARE:%';
CREATE OR REPLACE FUNCTION public.welfare_review(_id uuid,_stage text,_decision text,_note text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE r welfare_requests; v uuid; n text; BEGIN
SELECT * INTO r FROM welfare_requests WHERE id=_id FOR UPDATE; IF r.id IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;
IF NOT hr_active_staff() OR r.requested_by=auth.uid() THEN RAISE EXCEPTION 'You cannot review your own request; active reviewer access required'; END IF;
IF _decision IS NULL OR _decision NOT IN ('approve','reject') OR _note IS NULL OR length(btrim(_note))<3 OR length(_note)>4000 THEN RAISE EXCEPTION 'Choose a decision and enter a review note (3 to 4000 characters)'; END IF;
IF _stage='hr' THEN
IF NOT welfare_is_hr() OR r.status<>'hr_review' THEN RAISE EXCEPTION 'Only HR can review requests awaiting HR review'; END IF;
UPDATE welfare_requests SET status=CASE WHEN _decision='approve' THEN 'management_review' ELSE 'rejected' END,hr_reviewed_by=auth.uid(),hr_reviewed_at=now(),hr_note=btrim(_note) WHERE id=_id;
IF _decision='approve' THEN INSERT INTO notifications(title,message,recipient_id,reference_id,reference_type,action_url) SELECT 'Welfare approval requested','An HR-reviewed welfare request awaits management approval.',user_id,r.id::text,'welfare','/hr' FROM profiles WHERE is_active AND NOT is_locked AND user_id<>auth.uid() AND user_id<>r.requested_by AND (department='management' OR has_role(user_id,'super_admin')); END IF;
ELSIF _stage='management' THEN
IF NOT welfare_is_management() OR r.status<>'management_review' OR r.hr_reviewed_by IS NULL OR r.hr_reviewed_by=auth.uid() THEN RAISE EXCEPTION 'Management approval requires a different person after HR review'; END IF;
IF _decision='approve' THEN
SELECT full_name INTO n FROM hr_employees WHERE id=r.employee_id;
INSERT INTO vouchers(voucher_type,reference,narration,party_name,currency,exchange_rate,total_amount,ghs_equivalent,created_by) VALUES('payment','WELFARE:'||r.id::text,'Welfare payment '||r.id::text,n,'GHS',1,r.amount,r.amount,auth.uid()) RETURNING id INTO v;
INSERT INTO notifications(title,message,recipient_id,reference_id,reference_type,action_url) SELECT 'Welfare voucher ready','An approved welfare payment voucher awaits Accounts processing.',user_id,v::text,'voucher','/accounts/books?tab=vouchers' FROM profiles WHERE is_active AND NOT is_locked AND (department='accounts' OR has_role(user_id,'super_admin'));
END IF;
UPDATE welfare_requests SET status=CASE WHEN _decision='approve' THEN 'approved' ELSE 'rejected' END,management_reviewed_by=auth.uid(),management_reviewed_at=now(),management_note=btrim(_note),voucher_id=v WHERE id=_id;
ELSE RAISE EXCEPTION 'Invalid review stage'; END IF;
INSERT INTO notifications(title,message,recipient_id,reference_id,reference_type,action_url) VALUES('Welfare request updated','Your welfare request has been reviewed.',r.requested_by,r.id::text,'welfare','/hr'); RETURN v; END $$;