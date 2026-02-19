<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShipmentRequest extends StoreShipmentRequest
{
    public function rules(): array
    {
        $id = $this->route('shipment')?->id;
        $rules = parent::rules();
        $rules['bl_number']  = "nullable|string|max:50|unique:shipments,bl_number,{$id}";
        $rules['awb_number'] = "nullable|string|max:50|unique:shipments,awb_number,{$id}";
        $rules['status']     = 'nullable|string|in:pending,in_transit,at_port,customs,delivered,cancelled';
        $rules['clearance_status'] = 'nullable|string';
        $rules['ata']        = 'nullable|date';
        $rules['delivery_date'] = 'nullable|date';
        return $rules;
    }
}
