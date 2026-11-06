<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'photos_json' => 'array',
        'receipt_images_json' => 'array',
    ];
}
