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
        'status',
    ];
}
