<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'company_name'    => 'required|string|max:200',
            'contact_name'    => 'required|string|max:100',
            'email'           => 'required|email|unique:customers,email',
            'phone'           => 'required|string|max:20',
            'alt_phone'       => 'nullable|string|max:20',
            'address'         => 'nullable|string|max:500',
            'city'            => 'nullable|string|max:100',
            'country'         => 'nullable|string|max:100',
            'tin_number'      => 'nullable|string|max:50|unique:customers,tin_number',
            'industry'        => 'nullable|string|max:100',
            'credit_limit'    => 'nullable|numeric|min:0',
            'notes'           => 'nullable|string|max:1000',
        ];
    }
}
