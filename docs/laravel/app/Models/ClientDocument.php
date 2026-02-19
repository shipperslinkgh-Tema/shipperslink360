<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Facades\Storage;

class ClientDocument extends Model
{
    use HasUuids;

    protected $fillable = [
        'customer_id',
        'shipment_id',
        'document_name',
        'document_type',
        'file_url',
        'file_size',
        'status',
        'notes',
        'uploaded_by',
    ];

    // ── Relationships ─────────────────────────────────────────

    public function shipment()
    {
        return $this->belongsTo(ClientShipment::class, 'shipment_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // ── Helpers ───────────────────────────────────────────────

    /**
     * Generate a temporary signed download URL (15 minutes).
     */
    public function temporaryUrl(int $minutes = 15): string
    {
        return Storage::disk('s3')->temporaryUrl(
            $this->file_url,
            now()->addMinutes($minutes)
        );
    }
}
