<?php

namespace App\Http\Controllers;

use App\Models\ShippingLine;
use App\Models\DeliveryOrder;
use Illuminate\Http\Request;

class ShippingLineController extends Controller
{
    public function index(Request $request)
    {
        $shippingLines = ShippingLine::active()
            ->withCount('deliveryOrders')
            ->get();

        $deliveryOrders = DeliveryOrder::with(['shippingLine', 'shipment', 'customer'])
            ->latest('do_date')
            ->paginate(20);

        $demurrageOrders = DeliveryOrder::accruingDemurrage()
            ->with(['shippingLine', 'customer', 'shipment'])
            ->get();

        $expiringSoon = DeliveryOrder::expiringSoon(7)
            ->with(['shippingLine', 'customer'])
            ->get();

        $stats = [
            'total_lines'      => $shippingLines->count(),
            'active_dos'       => DeliveryOrder::where('status', 'obtained')->count(),
            'demurrage_count'  => $demurrageOrders->count(),
            'expiring_count'   => $expiringSoon->count(),
        ];

        return view('shipping-lines.index', compact('shippingLines', 'deliveryOrders', 'demurrageOrders', 'expiringSoon', 'stats'));
    }
}
