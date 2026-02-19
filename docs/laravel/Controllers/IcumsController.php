<?php

namespace App\Http\Controllers;

use App\Models\IcumsDeclaration;
use App\Models\Shipment;
use App\Models\Customer;
use App\Http\Requests\StoreIcumsDeclarationRequest;
use Illuminate\Http\Request;

class IcumsController extends Controller
{
    public function index(Request $request)
    {
        $query = IcumsDeclaration::with(['shipment', 'customer']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('declaration_number', 'like', "%{$search}%")
                  ->orWhere('hs_code', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($c) => $c->where('company_name', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $declarations = $query->latest()->paginate(20);

        return view('customs.icums.index', compact('declarations'));
    }

    public function create()
    {
        $shipments  = Shipment::active()->with('customer')->get();
        $customers  = Customer::active()->orderBy('company_name')->get();
        return view('customs.icums.create', compact('shipments', 'customers'));
    }

    public function store(StoreIcumsDeclarationRequest $request)
    {
        $data = $request->validated();
        $year = now()->year;
        $count = IcumsDeclaration::whereYear('created_at', $year)->count() + 1;
        $data['declaration_number'] = 'IMP-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
        $data['ghs_value'] = $data['customs_value'] * $data['exchange_rate'];
        $data['total_taxes'] = ($data['import_duty'] ?? 0) + ($data['vat'] ?? 0) + ($data['levy'] ?? 0) + ($data['nhil'] ?? 0) + ($data['getfund'] ?? 0);

        $declaration = IcumsDeclaration::create($data);
        return redirect()->route('icums.show', $declaration)->with('success', 'Declaration created.');
    }

    public function show(IcumsDeclaration $icum)
    {
        $icum->load(['shipment', 'customer']);
        return view('customs.icums.show', ['declaration' => $icum]);
    }

    public function updateStatus(Request $request, IcumsDeclaration $icum)
    {
        $request->validate(['status' => 'required|string']);
        $icum->update(['status' => $request->status]);
        return back()->with('success', 'Status updated.');
    }
}
