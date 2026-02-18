<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Account Locked — SLAC FreightLink 360</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: #dc2626; padding: 28px 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 20px; }
        .body { padding: 32px; }
        .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; padding: 12px 28px; background: #1e40af; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
        .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>🔒 Account Locked</h1>
    </div>
    <div class="body">
        <p>A staff account has been locked due to {{ $reason ?? 'too many failed login attempts' }}.</p>

        <div class="alert-box">
            <p style="margin:0 0 8px;font-weight:600;color:#dc2626;">Locked Account Details</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Name:</strong> {{ $user->profile?->full_name }}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Email:</strong> {{ $user->email }}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Staff ID:</strong> {{ $user->profile?->staff_id }}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Department:</strong> {{ ucwords(str_replace('_', ' ', $user->profile?->department)) }}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Locked At:</strong> {{ now()->format('d M Y, H:i') }}</p>
        </div>

        <p style="font-size:14px;color:#475569;">Please review and unlock the account if legitimate, or investigate if suspicious activity is suspected.</p>

        <div style="text-align:center;margin:28px 0;">
            <a href="{{ config('app.url') }}/admin/users" class="btn">Manage Users →</a>
        </div>
    </div>
    <div class="footer">
        <p>SLAC Shippers Link Africa Ltd · Automated Security Alert</p>
    </div>
</div>
</body>
</html>
