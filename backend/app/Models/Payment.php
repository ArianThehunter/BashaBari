<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'invoice_id',
        'tenant_id',
        'unit_id',
        'transaction_number',
        'val_id',
        'bank_tran_id',
        'payment_method',
        'card_type',
        'card_no',
        'amount',
        'store_amount',
        'currency',
        'payment_date',
        'status',
        'reference_number',
        'raw_response',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'store_amount' => 'integer',
            'raw_response' => 'array',
            'payment_date' => 'date:Y-m-d',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(LedgerEntry::class);
    }
}
