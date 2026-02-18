<?php

namespace App\Observers;

use App\Models\FinanceJobCost;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class FinanceJobCostObserver
{
    public function created(FinanceJobCost $jobCost): void
    {
        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'create_job_cost',
            'resource_type' => 'job_cost',
            'resource_id'   => $jobCost->id,
            'details'       => [
                'job_ref'      => $jobCost->job_ref,
                'description'  => $jobCost->description,
                'amount'       => $jobCost->amount,
                'currency'     => $jobCost->currency,
                'cost_category'=> $jobCost->cost_category,
                'vendor'       => $jobCost->vendor,
            ],
            'ip_address'    => Request::ip(),
        ]);
    }

    public function updated(FinanceJobCost $jobCost): void
    {
        $dirty = $jobCost->getDirty();

        $action = 'update_job_cost';
        if (isset($dirty['approval_status'])) {
            $action = $dirty['approval_status'] === 'approved'
                ? 'approve_job_cost'
                : 'reject_job_cost';
        }
        if (isset($dirty['payment_status']) && $dirty['payment_status'] === 'paid') {
            $action = 'pay_job_cost';
        }

        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => $action,
            'resource_type' => 'job_cost',
            'resource_id'   => $jobCost->id,
            'details'       => [
                'changes' => $dirty,
                'before'  => array_intersect_key($jobCost->getOriginal(), $dirty),
            ],
            'ip_address'    => Request::ip(),
        ]);
    }
}
