<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpotReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'township',
        'street_landmark',
        'time_seen',
        'condition_note',
        'reporter_phone',
        'photo_path',
        'reference_code',
        'status',
        'urgency',
        'assigned_to',
        'follow_up_note',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return ['resolved_at' => 'datetime'];
    }
}
