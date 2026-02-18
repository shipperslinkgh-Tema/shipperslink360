<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'customer_id'  => ['required', 'string', 'max:100', 'unique:client_profiles,customer_id'],
            'company_name' => ['required', 'string', 'max:255'],
            'contact_name' => ['required', 'string', 'max:255'],
            'email'        => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone'        => ['nullable', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.unique' => 'A client with this customer ID already exists.',
            'email.unique'       => 'A user with this email already exists.',
        ];
    }
}
