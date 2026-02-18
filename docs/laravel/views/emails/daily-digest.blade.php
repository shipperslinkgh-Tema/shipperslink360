<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Daily Digest — SLAC FreightLink 360</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 28px 32px; }
        .header h1 { color: #fff; margin: 0; font-size: 20px; }
        .header p { color: #bfdbfe; margin: 4px 0 0; font-size: 13px; }
        .body { padding: 28px 32px; }
        .section { margin-bottom: 28px; }
        .section h2 { font-size: 14px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
        .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .kpi { background: #f8fafc; border-radius: 8px; padding: 16px; }
        .kpi .num { font-size: 22px; font-weight: 700; color: #1e40af; }
        .kpi .lbl { font-size: 11px; color: #64748b; margin-top: 2px; }
        .item-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #dbeafe; color: #1e40af; }
        .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>Daily Operations Digest</h1>
        <p>{{ now()->format('l, F j, Y') }} · SLAC FreightLink 360</p>
    </div>
    <div class="body">
        <div class="section">
            <h2>Key Metrics</h2>
            <div class="kpi-grid">
                <div class="kpi"><div class="num">{{ $stats['active_shipments'] ?? 0 }}</div><div class="lbl">Active Shipments</div></div>
                <div class="kpi"><div class="num">{{ $stats['in_customs'] ?? 0 }}</div><div class="lbl">In Customs</div></div>
                <div class="kpi"><div class="num">GHS {{ number_format($stats['outstanding_invoices'] ?? 0, 0) }}</div><div class="lbl">Outstanding Invoices</div></div>
                <div class="kpi" style="background:#fff0f0;"><div class="num" style="color:#dc2626;">{{ $stats['overdue_count'] ?? 0 }}</div><div class="lbl">Overdue Invoices</div></div>
            </div>
        </div>

        @if(isset($overdueInvoices) && $overdueInvoices->isNotEmpty())
        <div class="section">
            <h2>⚠ Overdue Invoices</h2>
            @foreach($overdueInvoices as $inv)
            <div class="item-row">
                <div>
                    <div style="font-family:monospace;font-weight:600;">{{ $inv->invoice_number }}</div>
                    <div style="color:#64748b;font-size:12px;">{{ $inv->customer }}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:600;color:#dc2626;">{{ $inv->currency }} {{ number_format($inv->total_amount, 2) }}</div>
                    <div style="font-size:12px;color:#64748b;">{{ \Carbon\Carbon::parse($inv->due_date)->diffForHumans() }}</div>
                </div>
            </div>
            @endforeach
        </div>
        @endif

        @if(isset($pendingExpenses) && $pendingExpenses->isNotEmpty())
        <div class="section">
            <h2>📋 Expenses Awaiting Approval</h2>
            @foreach($pendingExpenses as $exp)
            <div class="item-row">
                <div><div>{{ $exp->description }}</div><div style="color:#64748b;font-size:12px;">{{ $exp->requested_by }}</div></div>
                <div style="font-weight:600;">GHS {{ number_format($exp->ghs_equivalent, 2) }}</div>
            </div>
            @endforeach
        </div>
        @endif

        <p style="font-size:13px;color:#64748b;margin-top:16px;">This digest is sent daily at 08:00 to department heads.</p>
    </div>
    <div class="footer">
        <p>SLAC Shippers Link Africa Ltd · Tema, Ghana</p>
        <p style="margin-top:4px;">&copy; {{ date('Y') }} All rights reserved.</p>
    </div>
</div>
</body>
</html>
