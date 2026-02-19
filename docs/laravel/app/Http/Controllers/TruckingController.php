<?php

namespace App\Http\Controllers;

use App\Models\Truck;
use App\Models\TruckingJob;
use App\Models\Customer;
use Illuminate\Http\Request;

class TruckingController extends Controller
{
    public function index(Request $request)
    {
        $trucks = Truck::withCount(['truckingJobs' => fn($q) => $q->where('status', 'in_progress')])->get();

        $jobs = TruckingJob::with(['truck', 'customer', 'shipment'])
            ->latest()
            ->paginate(20);

        $stats = [
            'fleet_size'    => $trucks->count(),
            'available'     => $trucks->where('status', 'available')->count(),
            'on_trip'       => $trucks->where('status', 'on_trip')->count(),
            'maintenance'   => $trucks->where('status', 'maintenance')->count(),
            'active_trips'  => TruckingJob::where('status', 'in_progress')->count(),
        ];

        return view('trucking.index', compact('trucks', 'jobs', 'stats'));
    }

    public function updateJobStatus(Request $request, TruckingJob $job)
    {
        $request->validate(['status' => 'required|string']);
        $job->update(['status' => $request->status]);

        if ($request->status === 'in_progress') {
            $job->truck->update(['status' => 'on_trip']);
        } elseif (in_array($request->status, ['completed', 'cancelled'])) {
            $job->truck->update(['status' => 'available']);
        }

        return back()->with('success', 'Job status updated.');
    }
}
