<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJobCostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description'   => ['sometimes', 'string', 'max:2000'],
            'amount'        => ['sometimes', 'numeric', 'min:0'],
            'currency'      => ['sometimes', 'string', Rule::in(['GHS', 'USD', 'EUR', 'GBP', 'CNY'])],
            'exchange_rate' => ['sometimes', 'numeric', 'min:0.0001'],
            'vendor'        => ['sometimes', 'nullable', 'string', 'max:255'],
            'due_date'      => ['sometimes', 'nullable', 'date'],
        ];
    }
}
