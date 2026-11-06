<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const LEGACY_METHODS = ['KBZPay', 'WavePay', 'AYAPay', 'CBPay'];

    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table): void {
            $table->string('payment_method', 100)->change();
        });
    }

    public function down(): void
    {
        $hasCustomMethods = DB::table('donations')
            ->whereNotIn('payment_method', self::LEGACY_METHODS)
            ->exists();

        if ($hasCustomMethods) {
            throw new RuntimeException('Cannot restore the legacy payment method enum while donations use custom payment methods.');
        }

        Schema::table('donations', function (Blueprint $table): void {
            $table->enum('payment_method', self::LEGACY_METHODS)->change();
        });
    }
};
