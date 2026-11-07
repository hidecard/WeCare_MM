<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    public const CATEGORIES = ['food', 'medicine', 'transport', 'supplies', 'shelter', 'other'];

    protected $fillable = [
        'fund_pool_id',
        'outreach_trip_id',
        'is_trip_sync',
        'category',
        'amount',
        'receipt_path',
        'period_start',
        'period_end',
        'reviewer_id',
        'note',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_trip_sync' => 'boolean',
            'period_start' => 'date',
            'period_end' => 'date',
            'archived_at' => 'datetime',
        ];
    }

    public function fundPool(): BelongsTo
    {
        return $this->belongsTo(FundPool::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * @param  Builder<Expense>  $query
     * @return Builder<Expense>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }
}
