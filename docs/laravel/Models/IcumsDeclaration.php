<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IcumsDeclaration extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'icums_declarations';

    protected $fillable = [
        'declaration_number', 'shipment_id', 'customer_id', 'declaration_type',
        'regime_code', 'hs_code', 'goods_description', 'customs_value',
        'currency', 'exchange_rate', 'ghs_value', 'import_duty', 'vat',
        'levy', 'nhil', 'getfund', 'total_taxes', 'status',
        'submission_date', 'assessment_date', 'payment_date', 'clearance_date',
        'payment_ref', 'customs_office', 'declarant', 'notes',
    ];

    protected $casts = [
        'customs_value'   => 'decimal:2',
        'exchange_rate'   => 'decimal:4',
        'ghs_value'       => 'decimal:2',
        'import_duty'     => 'decimal:2',
        'vat'             => 'decimal:2',
        'levy'            => 'decimal:2',
        'nhil'            => 'decimal:2',
        'getfund'         => 'decimal:2',
        'total_taxes'     => 'decimal:2',
        'submission_date' => 'date',
        'assessment_date' => 'date',
        'payment_date'    => 'date',
        'clearance_date'  => 'date',
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['draft', 'submitted', 'under_assessment']);
    }
}
