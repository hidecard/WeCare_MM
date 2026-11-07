<?php

namespace App\Models;

use App\Casts\PublicPhotoPaths;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OutreachTrip extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_date',
        'township',
        'elderly_helped_count',
        'meals_distributed',
        'medical_aid_count',
        'total_spent',
        'summary_note',
        'photos_json',
        'receipt_images_json',
    ];

    protected $casts = [
        'trip_date' => 'date',
        'total_spent' => 'decimal:2',
        'photos_json' => PublicPhotoPaths::class,
        'receipt_images_json' => 'array',
    ];

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function syncExpense(): HasOne
    {
        return $this->hasOne(Expense::class)->where('is_trip_sync', true);
    }
}
