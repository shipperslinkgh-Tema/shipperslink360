<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJobCostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer'          => ['required', 'string', 'max:255'],
            'customer_id'       => ['required', 'string', 'max:100'],
            'job_type'          => ['required', 'string', 'max:100'],
            'cost_category'     => ['required', 'string', 'max:100'],
            'description'       => ['required', 'string', 'max:2000'],
            'amount'            => ['required', 'numeric', 'min:0'],
            'currency'          => ['required', 'string', Rule::in(['GHS', 'USD', 'EUR', 'GBP', 'CNY'])],
            'exchange_rate'     => ['required', 'numeric', 'min:0.0001'],
            'vendor'            => ['nullable', 'string', 'max:255'],
            'due_date'          => ['nullable', 'date'],
            'shipment_ref'      => ['nullable', 'string', 'max:100'],
            'consolidation_ref' => ['nullable', 'string', 'max:100'],
            'is_reimbursable'   => ['sometimes', 'boolean'],
        ];
    }
}
