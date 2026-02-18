<?php

namespace App\Observers;

use App\Models\FinanceExpense;
use App\Models\AppNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class FinanceExpenseObserver
{
    public function created(FinanceExpense $expense): void
    {
        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'create_expense',
            'resource_type' => 'expense',
            'resource_id'   => $expense->id,
            'details'       => [
                'expense_ref' => $expense->expense_ref,
                'description' => $expense->description,
                'amount'      => $expense->amount,
                'currency'    => $expense->currency,
                'category'    => $expense->category,
            ],
            'ip_address'    => Request::ip(),
        ]);

        // Notify management on new expense submission
        AppNotification::create([
            'title'                => 'New Expense Submitted',
            'message'              => "A new expense ({$expense->expense_ref}) of {$expense->currency} " .
                                     number_format($expense->amount, 2) . " has been submitted for approval.",
            'type'                 => 'expense',
            'category'             => 'finance',
            'priority'             => 'medium',
            'recipient_department' => 'management',
            'reference_type'       => 'expense',
            'reference_id'         => $expense->id,
            'action_url'           => "/finance/expenses/{$expense->id}",
        ]);
    }

    public function updated(FinanceExpense $expense): void
    {
        $dirty = $expense->getDirty();

        $action = match ($dirty['status'] ?? null) {
            'approved' => 'approve_expense',
            'rejected' => 'reject_expense',
            'paid'     => 'pay_expense',
            default    => 'update_expense',
        };

        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => $action,
            'resource_type' => 'expense',
            'resource_id'   => $expense->id,
            'details'       => [
                'changes' => $dirty,
                'before'  => array_intersect_key($expense->getOriginal(), $dirty),
            ],
            'ip_address'    => Request::ip(),
        ]);
    }
}
