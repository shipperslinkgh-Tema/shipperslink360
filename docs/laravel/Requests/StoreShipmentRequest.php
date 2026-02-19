<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreShipmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'customer_id'       => 'required|exists:customers,id',
            'type'              => 'required|in:sea,air,road',
            'bl_number'         => 'nullable|string|max:50|unique:shipments,bl_number',
            'awb_number'        => 'nullable|string|max:50|unique:shipments,awb_number',
            'vessel_name'       => 'nullable|string|max:100',
            'voyage_number'     => 'nullable|string|max:50',
            'flight_number'     => 'nullable|string|max:50',
            'container_number'  => 'nullable|string|max:50',
            'container_type'    => 'nullable|string',
            'container_count'   => 'nullable|integer|min:1',
            'origin_country'    => 'required|string|max:100',
            'origin_port'       => 'required|string|max:100',
            'destination_port'  => 'required|string|max:100',
            'cargo_description' => 'nullable|string|max:500',
            'weight_kg'         => 'nullable|numeric|min:0',
            'volume_cbm'        => 'nullable|numeric|min:0',
            'etd'               => 'nullable|date',
            'eta'               => 'nullable|date|after_or_equal:etd',
            'incoterms'         => 'nullable|string|max:10',
            'notes'             => 'nullable|string|max:1000',
        ];
    }
}
