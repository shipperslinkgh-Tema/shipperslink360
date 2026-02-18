<?php

namespace App\Http\Requests\Banking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBankConnectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'bank_name'        => ['required', 'string', 'max:100'],
            'bank_display_name'=> ['required', 'string', 'max:150'],
            'account_name'     => ['required', 'string', 'max:255'],
            'account_number'   => ['required', 'string', 'max:50'],
            'account_type'     => ['required', 'string', Rule::in(['current', 'savings', 'fixed_deposit'])],
            'currency'         => ['required', 'string', Rule::in(['GHS', 'USD', 'EUR', 'GBP', 'CNY'])],
            'api_endpoint'     => ['nullable', 'url', 'max:2048'],
        ];
    }
}
