<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'invoice_type'    => 'required|in:proforma,commercial,credit_note,debit_note',
            'customer_id'     => 'required|exists:customers,id',
            'shipment_id'     => 'nullable|exists:shipments,id',
            'job_ref'         => 'nullable|string|max:50',
            'description'     => 'nullable|string|max:500',
            'service_type'    => 'required|string',
            'currency'        => 'required|string|max:10',
            'exchange_rate'   => 'required|numeric|min:0',
            'issue_date'      => 'required|date',
            'due_date'        => 'required|date|after_or_equal:issue_date',
            'notes'           => 'nullable|string|max:1000',
            'items'           => 'required|array|min:1',
            'items.*.description'    => 'required|string|max:200',
            'items.*.cost_category'  => 'nullable|string',
            'items.*.quantity'       => 'required|numeric|min:0.01',
            'items.*.unit_price'     => 'required|numeric|min:0',
            'items.*.currency'       => 'required|string|max:10',
            'items.*.tax_rate'       => 'nullable|numeric|min:0|max:100',
        ];
    }
}
