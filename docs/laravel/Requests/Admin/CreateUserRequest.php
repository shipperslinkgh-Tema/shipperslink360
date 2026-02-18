<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only admin / super_admin may create users
        return auth()->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'full_name'  => ['required', 'string', 'max:255'],
            'email'      => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'username'   => ['required', 'string', 'max:100', 'unique:profiles,username', 'alpha_dash'],
            'staff_id'   => ['required', 'string', 'max:50', 'unique:profiles,staff_id'],
            'department' => ['required', 'string', Rule::in([
                'operations', 'documentation', 'accounts', 'marketing',
                'customer_service', 'warehouse', 'management', 'super_admin',
            ])],
            'role'       => ['required', 'string', Rule::in(['super_admin', 'admin', 'manager', 'staff'])],
            'phone'      => ['nullable', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'      => 'A user with this email already exists.',
            'username.unique'   => 'This username is already taken.',
            'staff_id.unique'   => 'This staff ID is already in use.',
            'department.in'     => 'Invalid department selected.',
            'role.in'           => 'Invalid role selected.',
        ];
    }
}
