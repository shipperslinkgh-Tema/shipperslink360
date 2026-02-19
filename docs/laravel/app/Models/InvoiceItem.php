<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invoice_id', 'description', 'cost_category', 'quantity',
        'unit_price', 'currency', 'tax_rate', 'tax_amount',
        'total_amount', 'job_ref', 'sort_order',
    ];

    protected $casts = [
        'quantity'     => 'decimal:2',
        'unit_price'   => 'decimal:2',
        'tax_rate'     => 'decimal:2',
        'tax_amount'   => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
