<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'lease_id',
        'tenant_id',
        'unit_id',
        'invoice_number',
        'billing_period_month',
        'billing_period_year',
        'issue_date',
        'due_date',
        'subtotal_amount',
        'tax_amount',
        'late_fee_amount',
        'total_amount',
        'paid_amount',
        'due_amount',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'billing_period_month' => 'integer',
            'billing_period_year' => 'integer',
            'issue_date' => 'date:Y-m-d',
            'due_date' => 'date:Y-m-d',
            'subtotal_amount' => 'integer',
            'tax_amount' => 'integer',
            'late_fee_amount' => 'integer',
            'total_amount' => 'integer',
            'paid_amount' => 'integer',
            'due_amount' => 'integer',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
