<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecordPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount'         => ['required', 'numeric', 'min:0.01'],
            'paid_date'      => ['required', 'date'],
            'payment_method' => ['required', 'string', Rule::in(['bank_transfer', 'cheque', 'cash', 'mobile_money'])],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.min'           => 'Payment amount must be greater than zero.',
            'payment_method.in'    => 'Payment method must be one of: bank_transfer, cheque, cash, mobile_money.',
        ];
    }
}
