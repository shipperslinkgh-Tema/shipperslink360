<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\DeliveryOrder;
use App\Models\IcumsDeclaration;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $metrics = [
            'active_shipments'    => Shipment::active()->count(),
            'at_port'             => Shipment::atPort()->count(),
            'pending_clearance'   => Shipment::inCustoms()->count(),
            'sea_shipments'       => Shipment::sea()->active()->count(),
            'air_shipments'       => Shipment::air()->active()->count(),
            'road_shipments'      => Shipment::road()->active()->count(),
            'revenue_mtd'         => Invoice::paid()
                                        ->whereMonth('paid_date', now()->month)
                                        ->whereYear('paid_date', now()->year)
                                        ->sum('ghs_equivalent'),
            'overdue_invoices'    => Invoice::overdue()->count(),
            'expiring_dos'        => DeliveryOrder::expiringSoon(7)->count(),
            'pending_icums'       => IcumsDeclaration::pending()->count(),
        ];

        $recentShipments = Shipment::with('customer')
            ->latest()
            ->limit(10)
            ->get();

        $alerts = $this->buildAlerts();

        $clearanceJobs = Shipment::with(['icumsDeclarations', 'deliveryOrders'])
            ->active()
            ->whereIn('clearance_status', ['pending', 'icums_cleared', 'do_obtained'])
            ->limit(5)
            ->get();

        return view('dashboard.index', compact('metrics', 'recentShipments', 'alerts', 'clearanceJobs'));
    }

    private function buildAlerts(): array
    {
        $alerts = [];

        // Demurrage alerts
        $demurrageAlerts = DeliveryOrder::where('demurrage_accruing', true)->with('shipment', 'customer')->get();
        foreach ($demurrageAlerts as $do) {
            $alerts[] = [
                'type'        => 'demurrage',
                'title'       => "Demurrage Warning - {$do->container_number}",
                'description' => "Accruing at {$do->shippingLine?->name}. Amount: {$do->currency} " . number_format($do->demurrage_amount, 2),
                'priority'    => 'high',
                'time'        => $do->updated_at->diffForHumans(),
            ];
        }

        // Overdue invoices
        $overdueCount = Invoice::overdue()->count();
        if ($overdueCount > 0) {
            $alerts[] = [
                'type'        => 'payment',
                'title'       => "{$overdueCount} Overdue Invoice(s)",
                'description' => 'Outstanding invoices require follow-up.',
                'priority'    => 'medium',
                'time'        => 'Now',
            ];
        }

        // DO expiring
        $expiringDOs = DeliveryOrder::expiringSoon(3)->count();
        if ($expiringDOs > 0) {
            $alerts[] = [
                'type'        => 'deadline',
                'title'       => "{$expiringDOs} DO(s) Expiring in 3 Days",
                'description' => 'Delivery Orders need urgent action.',
                'priority'    => 'high',
                'time'        => 'Now',
            ];
        }

        return $alerts;
    }
}
