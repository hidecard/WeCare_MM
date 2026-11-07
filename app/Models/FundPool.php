<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FundPool extends Model
{
    use HasFactory;

    protected $fillable = [
        'title_mm',
        'title_en',
        'description',
        'description_mm',
        'unit_cost',
        'total_raised',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'unit_cost' => 'integer',
        'total_raised' => 'decimal:2',
    ];

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}
