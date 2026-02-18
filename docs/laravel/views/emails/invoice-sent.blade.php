<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice {{ $invoice->invoice_number }} — SLAC FreightLink 360</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: #1e40af; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; }
        .header p { color: #bfdbfe; margin: 4px 0 0; font-size: 14px; }
        .body { padding: 32px; }
        .section { margin-bottom: 24px; }
        .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .value { font-size: 15px; color: #1e293b; font-weight: 500; }
        .amount-box { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .amount-box .total { font-size: 28px; font-weight: 700; color: #1e40af; }
        .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
        .btn { display: inline-block; padding: 12px 28px; background: #1e40af; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>SLAC FreightLink 360</h1>
        <p>Invoice {{ $invoice->invoice_number }}</p>
    </div>
    <div class="body">
        <p style="font-size:15px;margin-bottom:24px;">Dear <strong>{{ $invoice->customer }}</strong>,</p>
        <p style="color:#475569;">Please find your invoice details below. Payment is due by <strong>{{ \Carbon\Carbon::parse($invoice->due_date)->format('F j, Y') }}</strong>.</p>

        <div class="amount-box">
            <div class="label">Total Amount Due</div>
            <div class="amount-box total">{{ $invoice->currency }} {{ number_format($invoice->total_amount, 2) }}</div>
            @if($invoice->currency !== 'GHS')
                <div style="font-size:12px;color:#64748b;margin-top:4px;">≈ GHS {{ number_format($invoice->ghs_equivalent, 2) }}</div>
            @endif
        </div>

        <div class="section">
            <div class="label">Invoice Number</div>
            <div class="value" style="font-family:monospace;">{{ $invoice->invoice_number }}</div>
        </div>
        <div class="section">
            <div class="label">Service</div>
            <div class="value">{{ $invoice->service_type }}</div>
        </div>
        @if($invoice->shipment_ref)
        <div class="section">
            <div class="label">Shipment Reference</div>
            <div class="value" style="font-family:monospace;">{{ $invoice->shipment_ref }}</div>
        </div>
        @endif
        <div class="section">
            <div class="label">Issue Date</div>
            <div class="value">{{ \Carbon\Carbon::parse($invoice->issue_date)->format('F j, Y') }}</div>
        </div>

        <div class="divider"></div>

        <div style="text-align:center;margin:28px 0;">
            <a href="{{ config('app.url') }}/portal/invoices" class="btn">View Invoice in Portal →</a>
        </div>

        <p style="font-size:13px;color:#64748b;">For payment or queries, please contact our accounts team at <a href="mailto:accounts@shipperslink.com" style="color:#1e40af;">accounts@shipperslink.com</a></p>
    </div>
    <div class="footer">
        <p>SLAC Shippers Link Africa Ltd · Tema, Ghana</p>
        <p style="margin-top:4px;">&copy; {{ date('Y') }} All rights reserved.</p>
    </div>
</div>
</body>
</html>
