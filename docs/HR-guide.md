# Human Resources — initial release

Open **Human Resources** in the staff menu.

## Employee records
Super admins, management and delegated HR administrators can add or edit employee records. Staff IDs are generated automatically. Select an existing active staff account to enable self-service; do not create a duplicate account. Enter confirmed employment dates, job title, supervisor and annual entitlement. Entitlement starts at zero until verified by HR, not an assumed statutory value.

## Attendance
A linked active/probation employee can clock in once per Ghana calendar day and clock out from Overview. Select Office or Field duty and enter the actual workplace. Times come from the server. Field-duty staff are counted as attended, not absent. The attendance report shows the latest 500 entries and can be filtered by date and exported as Excel-compatible CSV. No lateness, absence or overtime is inferred without work schedules.

## Leave
Request Annual, Sick or Other leave with dates and a reason. Current calculation uses weekdays excluding weekends, not configured public holidays. Overlapping pending/approved requests are rejected. Annual requests must stay within one calendar year. HR verifies annual entitlement; only approved annual leave reduces that year's balance. Pending requests can be cancelled by the employee.

HR/management can approve or reject other employees' requests. Delegated supervisors can review only employees assigned to them. Nobody can approve their own request, including super admins. Approval checks the annual balance again under a transaction lock. Generic notifications link to the request, and decisions retain notes and timestamps.

## Permissions and confidentiality
Super admins can delegate HR administrator or assigned-team supervisor access in Permissions, or remove that delegation. Management and super admins have HR administrative access already. Ordinary staff see only their linked employee profile, attendance and leave. Supervisors receive limited employee identifiers for their team's leave review, not access to confidential full profiles.

## Deliberately not activated
Payroll, banking/salary data, medical documents, qualifications, recruitment workflows, private HR documents, configurable approval chains, work schedules, attendance corrections, overtime, public-holiday calendars, advanced workforce assignments, performance and training are not enabled in this initial release. They require later verified phases. This release does not claim statutory Ghana payroll or employment compliance.