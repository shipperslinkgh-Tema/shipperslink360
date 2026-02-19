<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Customer;
use App\Models\ConsolidationLot;
use App\Http\Requests\StoreShipmentRequest;
use App\Http\Requests\UpdateShipmentRequest;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Shipment::with('customer');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('shipment_ref', 'like', "%{$search}%")
                  ->orWhere('bl_number', 'like', "%{$search}%")
                  ->orWhere('awb_number', 'like', "%{$search}%")
                  ->orWhere('container_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($c) => $c->where('company_name', 'like', "%{$search}%"));
            });
        }

        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $shipments = $query->latest()->paginate(25);

        $stats = [
            'total'      => Shipment::count(),
            'active'     => Shipment::active()->count(),
            'at_port'    => Shipment::atPort()->count(),
            'in_customs' => Shipment::inCustoms()->count(),
        ];

        return view('shipments.index', compact('shipments', 'stats'));
    }

    public function create()
    {
        $customers = Customer::active()->orderBy('company_name')->get();
        return view('shipments.create', compact('customers'));
    }

    public function store(StoreShipmentRequest $request)
    {
        $data = $request->validated();
        $year = now()->year;
        $count = Shipment::whereYear('created_at', $year)->count() + 1;
        $data['shipment_ref'] = 'SHP-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $shipment = Shipment::create($data);
        return redirect()->route('shipments.show', $shipment)->with('success', 'Shipment created.');
    }

    public function show(Shipment $shipment)
    {
        $shipment->load(['customer', 'icumsDeclarations', 'deliveryOrders.shippingLine', 'truckingJobs.truck', 'invoices']);
        return view('shipments.show', compact('shipment'));
    }

    public function edit(Shipment $shipment)
    {
        $customers = Customer::active()->orderBy('company_name')->get();
        return view('shipments.edit', compact('shipment', 'customers'));
    }

    public function update(UpdateShipmentRequest $request, Shipment $shipment)
    {
        $shipment->update($request->validated());
        return redirect()->route('shipments.show', $shipment)->with('success', 'Shipment updated.');
    }

    public function destroy(Shipment $shipment)
    {
        $shipment->delete();
        return redirect()->route('shipments.index')->with('success', 'Shipment removed.');
    }

    public function updateStatus(Request $request, Shipment $shipment)
    {
        $request->validate(['status' => 'required|string']);
        $shipment->update(['status' => $request->status]);
        return back()->with('success', 'Status updated.');
    }
}
