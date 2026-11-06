<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! DB::table('fund_pools')->where('is_active', true)->exists()) {
            $timestamp = now();
            $fundPools = [
                [
                    'title_mm' => 'နေ့စဉ်အစားအစာ',
                    'title_en' => 'Daily Meals',
                    'description' => 'Warm meals and basic support for elders on the street.',
                    'unit_cost' => 5000,
                ],
                [
                    'title_mm' => 'အရေးပေါ်ဆေးဝါး',
                    'title_en' => 'Emergency Medical',
                    'description' => 'Medicine, consultation, and urgent caregiver support.',
                    'unit_cost' => 10000,
                ],
                [
                    'title_mm' => 'အဝတ်အစား / အဖုံးအကာ',
                    'title_en' => 'Clothing & Blankets',
                    'description' => 'Warm blankets, clothing, and essential comfort kits.',
                    'unit_cost' => 15000,
                ],
                [
                    'title_mm' => 'အထွေထွေလမ်းဘေးထောက်ပံ့မှု',
                    'title_en' => 'General Outreach',
                    'description' => 'Flexible support for urgent street outreach needs.',
                    'unit_cost' => 8000,
                ],
            ];

            foreach ($fundPools as $pool) {
                $existingPool = DB::table('fund_pools')->where('title_en', $pool['title_en'])->first();

                if ($existingPool) {
                    DB::table('fund_pools')
                        ->where('id', $existingPool->id)
                        ->update(['is_active' => true, 'updated_at' => $timestamp]);

                    continue;
                }

                DB::table('fund_pools')->insert([
                    ...$pool,
                    'total_raised' => 0,
                    'is_active' => true,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
            }
        }

        $unverifiedPaymentMethods = [
            ['name' => 'KBZPay', 'account_number' => '09 123 456 789'],
            ['name' => 'WavePay', 'account_number' => '09 987 654 321'],
            ['name' => 'AYAPay', 'account_number' => '09 555 666 777'],
            ['name' => 'CBPay', 'account_number' => '09 333 444 555'],
        ];

        foreach ($unverifiedPaymentMethods as $method) {
            DB::table('payment_methods')
                ->where('name', $method['name'])
                ->where('account_number', $method['account_number'])
                ->update(['is_active' => false, 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        // Keep seeded funds to avoid deleting pools that may already have donations.
        // Do not reactivate unverified payment account details on rollback.
    }
};
