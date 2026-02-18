<?php

namespace App\Http\Requests\Banking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBankConnectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'bank_display_name' => ['sometimes', 'string', 'max:150'],
            'account_name'      => ['sometimes', 'string', 'max:255'],
            'account_type'      => ['sometimes', 'string', Rule::in(['current', 'savings', 'fixed_deposit'])],
            'api_endpoint'      => ['sometimes', 'nullable', 'url', 'max:2048'],
            'is_active'         => ['sometimes', 'boolean'],
        ];
    }
}
