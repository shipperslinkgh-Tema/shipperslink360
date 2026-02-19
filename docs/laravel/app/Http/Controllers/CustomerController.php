<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::withCount(['shipments', 'invoices']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('customer_code', 'like', "%{$search}%")
                  ->orWhere('contact_name', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('is_active', $status === 'active');
        }

        if ($creditStatus = $request->get('credit_status')) {
            $query->where('credit_status', $creditStatus);
        }

        $customers = $query->orderBy('company_name')->paginate(20);

        $stats = [
            'total'   => Customer::count(),
            'active'  => Customer::active()->count(),
            'on_hold' => Customer::onHold()->count(),
        ];

        return view('customers.index', compact('customers', 'stats'));
    }

    public function create()
    {
        return view('customers.create');
    }

    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());
        return redirect()->route('customers.show', $customer)->with('success', 'Customer created successfully.');
    }

    public function show(Customer $customer)
    {
        $customer->load(['shipments' => fn($q) => $q->latest()->limit(10), 'invoices' => fn($q) => $q->latest()->limit(10), 'documents']);
        return view('customers.show', compact('customer'));
    }

    public function edit(Customer $customer)
    {
        return view('customers.edit', compact('customer'));
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());
        return redirect()->route('customers.show', $customer)->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->route('customers.index')->with('success', 'Customer removed.');
    }
}
