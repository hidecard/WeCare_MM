<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

    protected $hidden = ['tracking_token'];

    protected $fillable = [
        'fund_pool_id',
        'donor_name',
        'is_anonymous',
        'phone',
        'donor_email',
        'amount',
        'payment_method',
        'slip_image_path',
        'wish_note',
        'status',
        'review_note',
        'certificate_code',
        'tracking_token',
        'approved_at',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function fundPool()
    {
        return $this->belongsTo(FundPool::class);
    }
}
