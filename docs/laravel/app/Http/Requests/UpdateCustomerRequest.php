<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends StoreCustomerRequest
{
    public function rules(): array
    {
        $id = $this->route('customer')?->id;
        return array_merge(parent::rules(), [
            'email'      => "required|email|unique:customers,email,{$id}",
            'tin_number' => "nullable|string|max:50|unique:customers,tin_number,{$id}",
            'credit_status' => 'nullable|string|in:good,watch,hold,suspend',
            'is_active'     => 'nullable|boolean',
        ]);
    }
}
