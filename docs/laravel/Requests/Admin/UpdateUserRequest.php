<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'full_name'  => ['sometimes', 'string', 'max:255'],
            'phone'      => ['sometimes', 'nullable', 'string', 'max:30'],
            'department' => ['sometimes', 'string', Rule::in([
                'operations', 'documentation', 'accounts', 'marketing',
                'customer_service', 'warehouse', 'management', 'super_admin',
            ])],
            'role'       => ['sometimes', 'string', Rule::in(['super_admin', 'admin', 'manager', 'staff'])],
            'avatar_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
        ];
    }
}
