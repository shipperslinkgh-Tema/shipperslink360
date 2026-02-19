<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'category'     => ['required', 'string', Rule::in([
                'fuel', 'maintenance', 'office', 'utilities', 'salary',
                'travel', 'customs_duties', 'port_charges', 'miscellaneous',
            ])],
            'description'  => ['required', 'string', 'max:2000'],
            'currency'     => ['required', 'string', Rule::in(['GHS', 'USD', 'EUR', 'GBP', 'CNY'])],
            'amount'       => ['required', 'numeric', 'min:0.01'],
            'exchange_rate'=> ['required', 'numeric', 'min:0.0001'],
            'expense_date' => ['required', 'date'],
            'notes'        => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'category.in'  => 'Invalid expense category.',
            'currency.in'  => 'Currency must be one of: GHS, USD, EUR, GBP, CNY.',
            'amount.min'   => 'Amount must be greater than zero.',
        ];
    }
}
