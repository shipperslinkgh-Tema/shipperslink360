<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Shipment Update — SLAC FreightLink 360</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: #0f172a; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 20px; }
        .header p { color: #94a3b8; margin: 4px 0 0; font-size: 13px; }
        .body { padding: 32px; }
        .status-pill { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; background: #dbeafe; color: #1e40af; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .detail-row .key { color: #64748b; }
        .detail-row .val { font-weight: 500; }
        .btn { display: inline-block; padding: 12px 28px; background: #1e40af; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>Shipment Status Update</h1>
        <p>SLAC FreightLink 360</p>
    </div>
    <div class="body">
        <p>Dear <strong>{{ $clientName }}</strong>,</p>
        <p style="color:#475569;">Your shipment status has been updated.</p>

        <div style="text-align:center;margin:28px 0;">
            <span class="status-pill">{{ strtoupper(str_replace('_', ' ', $shipment->status)) }}</span>
        </div>

        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:20px 0;">
            <div class="detail-row"><span class="key">B/L Number</span><span class="val" style="font-family:monospace;">{{ $shipment->bl_number }}</span></div>
            @if($shipment->container_number)
            <div class="detail-row"><span class="key">Container</span><span class="val" style="font-family:monospace;">{{ $shipment->container_number }}</span></div>
            @endif
            <div class="detail-row"><span class="key">Route</span><span class="val">{{ $shipment->origin }} → {{ $shipment->destination }}</span></div>
            @if($shipment->vessel_name)
            <div class="detail-row"><span class="key">Vessel</span><span class="val">{{ $shipment->vessel_name }}</span></div>
            @endif
            @if($shipment->eta)
            <div class="detail-row" style="border:none;"><span class="key">ETA</span><span class="val">{{ \Carbon\Carbon::parse($shipment->eta)->format('d M Y') }}</span></div>
            @endif
        </div>

        <div style="text-align:center;margin:28px 0;">
            <a href="{{ config('app.url') }}/portal/shipments/{{ $shipment->id }}" class="btn">Track Shipment →</a>
        </div>

        <p style="font-size:13px;color:#64748b;">Questions? Contact us at <a href="mailto:operations@shipperslink.com" style="color:#1e40af;">operations@shipperslink.com</a></p>
    </div>
    <div class="footer">
        <p>SLAC Shippers Link Africa Ltd · Tema, Ghana</p>
        <p style="margin-top:4px;">&copy; {{ date('Y') }} All rights reserved.</p>
    </div>
</div>
</body>
</html>
