<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreJobCostRequest;
use App\Http\Requests\Finance\UpdateJobCostRequest;
use App\Models\AuditLog;
use App\Models\FinanceJobCost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobCostController extends Controller
{
    /**
     * List job costs with filters.
     * GET /api/v1/finance/job-costs
     */
    public function index(Request $request): JsonResponse
    {
        $query = FinanceJobCost::query()
            ->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('job_ref', 'like', "%{$request->search}%")
                  ->orWhere('customer', 'like', "%{$request->search}%");
            }))
            ->when($request->approval_status, fn ($q) => $q->where('approval_status', $request->approval_status))
            ->when($request->payment_status, fn ($q) => $q->where('payment_status', $request->payment_status))
            ->when($request->customer_id, fn ($q) => $q->where('customer_id', $request->customer_id))
            ->orderByDesc('created_at');

        $costs = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $costs->items(),
            'meta' => [
                'current_page' => $costs->currentPage(),
                'last_page'    => $costs->lastPage(),
                'per_page'     => $costs->perPage(),
                'total'        => $costs->total(),
            ],
        ]);
    }

    /**
     * Create a job cost.
     * POST /api/v1/finance/job-costs
     */
    public function store(StoreJobCostRequest $request): JsonResponse
    {
        $data = $request->validated();

        $data['job_ref']         = $this->generateJobRef();
        $data['ghs_equivalent']  = $data['amount'] * ($data['exchange_rate'] ?? 1);
        $data['created_by']      = auth()->id();
        $data['approval_status'] = 'pending';
        $data['payment_status']  = 'unpaid';

        $cost = FinanceJobCost::create($data);

        AuditLog::log(
            userId: auth()->id(),
            action: 'create_job_cost',
            resourceType: 'job_cost',
            resourceId: $cost->id,
            details: ['job_ref' => $cost->job_ref],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $cost], 201);
    }

    /**
     * Show a single job cost.
     * GET /api/v1/finance/job-costs/{id}
     */
    public function show(string $id): JsonResponse
    {
        return response()->json(['data' => FinanceJobCost::findOrFail($id)]);
    }

    /**
     * Update a job cost.
     * PUT /api/v1/finance/job-costs/{id}
     */
    public function update(UpdateJobCostRequest $request, string $id): JsonResponse
    {
        $cost = FinanceJobCost::findOrFail($id);

        abort_if($cost->approval_status !== 'pending', 422, 'Only pending job costs can be edited.');

        $data = $request->validated();
        if (isset($data['amount'])) {
            $data['ghs_equivalent'] = $data['amount'] * ($data['exchange_rate'] ?? $cost->exchange_rate);
        }

        $cost->update($data);

        return response()->json(['data' => $cost->fresh()]);
    }

    /**
     * Approve a job cost.
     * POST /api/v1/finance/job-costs/{id}/approve
     */
    public function approve(string $id): JsonResponse
    {
        $cost = FinanceJobCost::findOrFail($id);

        abort_if($cost->approval_status !== 'pending', 422, 'Job cost is not in a pending state.');

        $cost->approve(auth()->id());

        AuditLog::log(
            userId: auth()->id(),
            action: 'approve_job_cost',
            resourceType: 'job_cost',
            resourceId: $cost->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $cost->fresh()]);
    }

    /**
     * Reject a job cost.
     * POST /api/v1/finance/job-costs/{id}/reject
     */
    public function reject(string $id): JsonResponse
    {
        $cost = FinanceJobCost::findOrFail($id);

        abort_if($cost->approval_status !== 'pending', 422, 'Job cost is not in a pending state.');

        $cost->update(['approval_status' => 'rejected']);

        AuditLog::log(
            userId: auth()->id(),
            action: 'reject_job_cost',
            resourceType: 'job_cost',
            resourceId: $cost->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $cost->fresh()]);
    }

    /**
     * Mark a job cost as paid.
     * POST /api/v1/finance/job-costs/{id}/pay
     */
    public function markPaid(Request $request, string $id): JsonResponse
    {
        $cost = FinanceJobCost::findOrFail($id);

        abort_if($cost->approval_status !== 'approved', 422, 'Job cost must be approved before marking as paid.');
        abort_if($cost->payment_status === 'paid', 422, 'Job cost is already fully paid.');

        $amount = $request->input('amount', $cost->amount);
        $cost->markPaid($amount, $request->paid_date);

        AuditLog::log(
            userId: auth()->id(),
            action: 'pay_job_cost',
            resourceType: 'job_cost',
            resourceId: $cost->id,
            details: ['amount' => $amount],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $cost->fresh()]);
    }

    // ── Private helpers ───────────────────────────────────────────

    private function generateJobRef(): string
    {
        $year  = now()->year;
        $count = FinanceJobCost::whereYear('created_at', $year)->count();

        return sprintf('JOB-%d-%06d', $year, $count + 1);
    }
}
