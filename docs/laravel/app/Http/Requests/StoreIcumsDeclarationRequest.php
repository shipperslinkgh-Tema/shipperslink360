<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreIcumsDeclarationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'shipment_id'      => 'required|exists:shipments,id',
            'customer_id'      => 'required|exists:customers,id',
            'declaration_type' => 'required|in:import,export,transit,re-import',
            'hs_code'          => 'nullable|string|max:20',
            'goods_description'=> 'required|string|max:500',
            'customs_value'    => 'required|numeric|min:0',
            'currency'         => 'required|string|max:10',
            'exchange_rate'    => 'required|numeric|min:0',
            'import_duty'      => 'nullable|numeric|min:0',
            'vat'              => 'nullable|numeric|min:0',
            'levy'             => 'nullable|numeric|min:0',
            'nhil'             => 'nullable|numeric|min:0',
            'getfund'          => 'nullable|numeric|min:0',
            'customs_office'   => 'nullable|string|max:100',
            'submission_date'  => 'nullable|date',
            'notes'            => 'nullable|string|max:1000',
        ];
    }
}
