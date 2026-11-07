<?php

namespace Database\Seeders;

use App\Models\FundPool;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            throw new \RuntimeException('Do not seed production. Run php artisan wecare:bootstrap-admin once instead.');
        }

        $this->call(RoleUserSeeder::class);
        $this->seedFundPools();
    }

    private function seedFundPools(): void
    {
        $fundPools = [
            [
                'title_mm' => 'နေ့စဉ် အစားအစာ',
                'title_en' => 'Daily Meals',
                'description' => 'Warm meals and basic support for elders on the street.',
                'unit_cost' => 5000,
                'total_raised' => 0,
                'is_active' => true,
            ],
            [
                'title_mm' => 'အရေးပေါ် ဆေးဝါး',
                'title_en' => 'Emergency Medical',
                'description' => 'Medicine, consultation, and urgent caregiver support.',
                'unit_cost' => 10000,
                'total_raised' => 0,
                'is_active' => true,
            ],
            [
                'title_mm' => 'အဝတ်အစား / အဖုံးအကာ',
                'title_en' => 'Clothing & Blankets',
                'description' => 'Warm blankets, clothing, and essential comfort kits.',
                'unit_cost' => 15000,
                'total_raised' => 0,
                'is_active' => true,
            ],
            [
                'title_mm' => 'အထွေထွေ လမ်းဘေးထောက်ပံ့မှု',
                'title_en' => 'General Outreach',
                'description' => 'Flexible support for urgent street outreach needs.',
                'unit_cost' => 8000,
                'total_raised' => 0,
                'is_active' => true,
            ],
        ];

        foreach ($fundPools as $pool) {
            FundPool::query()->updateOrCreate(
                ['title_en' => $pool['title_en']],
                $pool,
            );
        }
    }
}
