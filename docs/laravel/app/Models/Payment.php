<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'payment_ref', 'invoice_id', 'customer_id', 'type', 'category',
        'amount', 'currency', 'exchange_rate', 'ghs_equivalent',
        'method', 'bank_account', 'transaction_ref', 'status',
        'payment_date', 'value_date', 'description',
        'approval_status', 'approved_by', 'approval_date',
        'created_by', 'notes',
    ];

    protected $casts = [
        'amount'         => 'decimal:2',
        'exchange_rate'  => 'decimal:4',
        'ghs_equivalent' => 'decimal:2',
        'payment_date'   => 'date',
        'value_date'     => 'date',
        'approval_date'  => 'date',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function scopeIncoming($query)
    {
        return $query->where('type', 'incoming');
    }

    public function scopeOutgoing($query)
    {
        return $query->where('type', 'outgoing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
