<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'invoice_id'     => ['required', 'uuid', 'exists:invoices,id'],
            'amount'         => ['required', 'numeric', 'min:0.01'],
            'currency'       => ['required', 'string', Rule::in(['GHS', 'USD', 'EUR', 'GBP', 'CNY'])],
            'exchange_rate'  => ['required', 'numeric', 'min:0.0001'],
            'payment_method' => ['required', 'string', Rule::in([
                'bank_transfer', 'cash', 'cheque', 'mobile_money', 'card',
            ])],
            'payment_date'   => ['required', 'date'],
            'reference'      => ['nullable', 'string', 'max:255'],
            'notes'          => ['nullable', 'string', 'max:2000'],
        ];
    }
}
