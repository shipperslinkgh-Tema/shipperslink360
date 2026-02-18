<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_type'  => ['sometimes', 'string', 'max:100'],
            'currency'      => ['sometimes', 'string', Rule::in(['GHS', 'USD', 'EUR', 'GBP', 'CNY'])],
            'exchange_rate' => ['sometimes', 'numeric', 'min:0.0001'],
            'subtotal'      => ['sometimes', 'numeric', 'min:0'],
            'tax_amount'    => ['sometimes', 'numeric', 'min:0'],
            'total_amount'  => ['sometimes', 'numeric', 'min:0'],
            'due_date'      => ['sometimes', 'date'],
            'description'   => ['sometimes', 'nullable', 'string', 'max:2000'],
            'notes'         => ['sometimes', 'nullable', 'string', 'max:2000'],
            'status'        => ['sometimes', 'string', Rule::in(['draft', 'sent', 'disputed', 'cancelled'])],
        ];
    }
}
