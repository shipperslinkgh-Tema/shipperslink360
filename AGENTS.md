# Architecture rules

- HR uses the existing staff authentication and `/hr` workspace; self-service is available to staff while elevated access is enforced by database policies and RPCs, not navigation visibility.
- Keep HR permissions in `hr_access`, separate from identity profiles and existing operational roles, so HR delegation does not grant logistics or finance privileges.
- Employee records link existing staff accounts without creating new login identities, and future workforce assignments must reference existing operational records.
- Attendance and leave writes use authenticated database functions with server timestamps, locked employee rows for approvals, self-approval protection and audit triggers.
- Keep confidential HR details out of shared notifications and generic audit payloads; notifications contain generic review prompts and audit entries identify the changed record.
- Payroll remains disabled until effective-dated statutory rules and duplicate-safe integration with the existing Accounts Portal are verified.
- Welfare policies are user-filled and version-snapshotted on submission; authenticated RPCs enforce HR review followed by a different management approver and create one linked draft Accounts voucher atomically, without posting or duplicating a ledger.