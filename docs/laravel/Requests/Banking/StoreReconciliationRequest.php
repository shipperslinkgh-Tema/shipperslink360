<?php

namespace App\Http\Requests\Banking;

use Illuminate\Foundation\Http\FormRequest;

class StoreReconciliationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_connection_id'  => ['required', 'string', 'exists:bank_connections,id'],
            'period_start'        => ['required', 'date'],
            'period_end'          => ['required', 'date', 'after_or_equal:period_start'],
            'bank_opening_balance'=> ['required', 'numeric'],
            'bank_closing_balance'=> ['required', 'numeric'],
            'book_opening_balance'=> ['required', 'numeric'],
            'book_closing_balance'=> ['required', 'numeric'],
            'notes'               => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'period_end.after_or_equal' => 'Period end date must be after or equal to period start date.',
            'bank_connection_id.exists' => 'The selected bank connection does not exist.',
        ];
    }
}
