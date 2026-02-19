<?php

namespace App\Http\Controllers;

use App\Models\ConsolidationLot;
use App\Models\Shipment;
use Illuminate\Http\Request;

class ConsolidationController extends Controller
{
    public function index(Request $request)
    {
        $lots = ConsolidationLot::withCount('shipments')
            ->latest()
            ->paginate(20);

        $openLots = ConsolidationLot::open()->withCount('shipments')->get();

        $stats = [
            'total'      => ConsolidationLot::count(),
            'open'       => ConsolidationLot::open()->count(),
            'in_transit' => ConsolidationLot::where('status', 'in_transit')->count(),
            'at_port'    => ConsolidationLot::where('status', 'at_port')->count(),
        ];

        return view('consolidation.index', compact('lots', 'openLots', 'stats'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'type'             => 'required|string',
            'origin_country'   => 'required|string',
            'origin_port'      => 'required|string',
            'destination_port' => 'required|string',
            'eta'              => 'nullable|date',
        ]);

        $year = now()->year;
        $count = ConsolidationLot::whereYear('created_at', $year)->count() + 1;
        $data = $request->all();
        $data['lot_ref'] = 'LOT-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $lot = ConsolidationLot::create($data);
        return redirect()->route('consolidation.index')->with('success', "Lot {$lot->lot_ref} created.");
    }
}
