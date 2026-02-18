<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // department access enforced via middleware
    }

    public function rules(): array
    {
        return [
            'customer'           => ['required', 'string', 'max:255'],
            'customer_id'        => ['required', 'string', 'max:100'],
            'invoice_type'       => ['required', 'string', Rule::in(['standard', 'proforma', 'credit_note'])],
            'service_type'       => ['required', 'string', 'max:100'],
            'currency'           => ['required', 'string', Rule::in(['GHS', 'USD', 'EUR', 'GBP', 'CNY'])],
            'exchange_rate'      => ['required', 'numeric', 'min:0.0001'],
            'subtotal'           => ['required', 'numeric', 'min:0'],
            'tax_amount'         => ['required', 'numeric', 'min:0'],
            'total_amount'       => ['required', 'numeric', 'min:0'],
            'due_date'           => ['required', 'date', 'after_or_equal:today'],
            'description'        => ['nullable', 'string', 'max:2000'],
            'notes'              => ['nullable', 'string', 'max:2000'],
            'job_ref'            => ['nullable', 'string', 'max:100'],
            'shipment_ref'       => ['nullable', 'string', 'max:100'],
            'consolidation_ref'  => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'due_date.after_or_equal' => 'Due date must be today or a future date.',
            'currency.in'             => 'Currency must be one of: GHS, USD, EUR, GBP, CNY.',
        ];
    }
}
