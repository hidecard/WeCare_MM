<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Restore the payment options that were previously hard-coded in the public
     * donation form, but never replace payment accounts configured by an admin.
     */
    public function up(): void
    {
        if (DB::table('payment_methods')->exists()) {
            return;
        }

        $timestamp = now();
        $methods = [
            ['name' => 'KBZPay', 'account_name' => 'KBZPay QR', 'account_number' => '09 123 456 789'],
            ['name' => 'WavePay', 'account_name' => 'WavePay QR', 'account_number' => '09 987 654 321'],
            ['name' => 'AYAPay', 'account_name' => 'AYA Pay QR', 'account_number' => '09 555 666 777'],
            ['name' => 'CBPay', 'account_name' => 'CB Pay QR', 'account_number' => '09 333 444 555'],
        ];

        DB::table('payment_methods')->insert(array_map(
            static fn (array $method, int $index): array => [
                ...$method,
                'is_active' => true,
                'sort_order' => $index,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            $methods,
            array_keys($methods),
        ));
    }

    public function down(): void
    {
        $legacyMethods = [
            ['name' => 'KBZPay', 'account_number' => '09 123 456 789'],
            ['name' => 'WavePay', 'account_number' => '09 987 654 321'],
            ['name' => 'AYAPay', 'account_number' => '09 555 666 777'],
            ['name' => 'CBPay', 'account_number' => '09 333 444 555'],
        ];

        foreach ($legacyMethods as $method) {
            DB::table('payment_methods')
                ->where('name', $method['name'])
                ->where('account_number', $method['account_number'])
                ->delete();
        }
    }
};
