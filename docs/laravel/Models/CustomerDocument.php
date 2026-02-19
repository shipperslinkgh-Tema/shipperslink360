<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerDocument extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'customer_id', 'document_name', 'document_type', 'file_path',
        'file_name', 'file_size', 'mime_type', 'status',
        'expiry_date', 'uploaded_by', 'notes',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))
                     ->where('expiry_date', '>=', now())
                     ->where('status', 'active');
    }
}
