<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weekly Finance Report</title>
    <style>
        body { margin: 0; padding: 0; background: #0f172a; font-family: 'Segoe UI', Arial, sans-serif; }
        .wrapper { max-width: 620px; margin: 0 auto; background: #1e293b; }
        .header { background: linear-gradient(135deg, #1e3a5f, #0f172a); padding: 36px 40px; text-align: center; border-bottom: 3px solid #f59e0b; }
        .header h1 { color: #f59e0b; font-size: 22px; margin: 0 0 6px; }
        .header p { color: #94a3b8; font-size: 13px; margin: 0; }
        .body { padding: 32px 40px; }
        .greeting { color: #e2e8f0; font-size: 15px; margin-bottom: 20px; }
        .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
        .kpi { background: #0f172a; border-radius: 8px; padding: 16px; }
        .kpi-label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-value { color: #f8fafc; font-size: 22px; font-weight: 700; margin: 4px 0 0; }
        .kpi-value.positive { color: #10b981; }
        .kpi-value.negative { color: #ef4444; }
        .section-title { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; }
        .stats-row { display: flex; gap: 8px; margin-bottom: 8px; }
        .stat { flex: 1; background: #0f172a; border-radius: 6px; padding: 12px; text-align: center; }
        .stat-num { color: #f8fafc; font-size: 18px; font-weight: 700; }
        .stat-lbl { color: #64748b; font-size: 10px; margin-top: 2px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .badge-green { background: #065f46; color: #6ee7b7; }
        .badge-red { background: #7f1d1d; color: #fca5a5; }
        .footer { background: #0f172a; padding: 20px 40px; text-align: center; }
        .footer p { color: #475569; font-size: 11px; margin: 4px 0; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>📊 Weekly Finance Report</h1>
        <p>{{ $weekLabel }} &nbsp;|&nbsp; SLAC FreightLink 360</p>
    </div>

    <div class="body">
        <p class="greeting">Hi {{ $recipientName }},</p>
        <p style="color:#94a3b8;font-size:14px;margin-bottom:24px;">
            Here's your weekly financial performance summary.
        </p>

        {{-- Key Financial KPIs --}}
        <div class="kpi-grid">
            <div class="kpi">
                <div class="kpi-label">Total Revenue</div>
                <div class="kpi-value positive">GHS {{ number_format($report['totalRevenue'], 2) }}</div>
            </div>
            <div class="kpi">
                <div class="kpi-label">Total Expenses</div>
                <div class="kpi-value negative">GHS {{ number_format($report['totalExpenses'], 2) }}</div>
            </div>
            <div class="kpi" style="grid-column: span 2;">
                <div class="kpi-label">Net Profit / Loss</div>
                <div class="kpi-value {{ $report['netProfit'] >= 0 ? 'positive' : 'negative' }}">
                    {{ $report['netProfit'] >= 0 ? '+' : '' }}GHS {{ number_format($report['netProfit'], 2) }}
                </div>
            </div>
        </div>

        {{-- Invoice Stats --}}
        <div class="section-title">Invoice Summary</div>
        <div class="stats-row">
            <div class="stat">
                <div class="stat-num">{{ $report['invoicesIssued'] }}</div>
                <div class="stat-lbl">Issued</div>
            </div>
            <div class="stat">
                <div class="stat-num" style="color:#10b981">{{ $report['invoicesPaid'] }}</div>
                <div class="stat-lbl">Paid</div>
            </div>
            <div class="stat">
                <div class="stat-num" style="color:#ef4444">{{ $report['invoicesOverdue'] }}</div>
                <div class="stat-lbl">Overdue</div>
            </div>
        </div>

        {{-- Expense Stats --}}
        <div class="section-title">Expense Summary</div>
        <div class="stats-row">
            <div class="stat">
                <div class="stat-num" style="color:#10b981">{{ $report['expensesApproved'] }}</div>
                <div class="stat-lbl">Approved</div>
            </div>
            <div class="stat">
                <div class="stat-num" style="color:#f59e0b">{{ $report['expensesPending'] }}</div>
                <div class="stat-lbl">Pending Approval</div>
            </div>
            <div class="stat">
                <div class="stat-num">{{ $report['topExpenseCategory'] ?? 'N/A' }}</div>
                <div class="stat-lbl">Top Category</div>
            </div>
        </div>

        {{-- Reconciliation --}}
        <div class="section-title">Bank Reconciliation</div>
        <p style="color:#94a3b8;font-size:14px;">
            Status this week:
            @if($report['bankReconciled'])
                <span class="badge badge-green">✓ Approved</span>
            @else
                <span class="badge badge-red">⚠ Pending</span>
            @endif
        </p>
    </div>

    <div class="footer">
        <p>SLAC FreightLink 360 &mdash; Automated Weekly Report</p>
        <p>Do not reply to this email. Generated {{ now()->format('F j, Y \a\t H:i T') }}</p>
    </div>
</div>
</body>
</html>
