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
                'description_mm' => 'လမ်းဘေးရှိ သက်ကြီးရွယ်အိုများအတွက် နွေးထွေးသော အစားအစာနှင့် အခြေခံစောင့်ရှောက်မှု။',
                'unit_cost' => 5000,
                'total_raised' => 0,
                'is_active' => true,
            ],
            [
                'title_mm' => 'အရေးပေါ် ဆေးဝါး',
                'title_en' => 'Emergency Medical',
                'description' => 'Medicine, consultation, and urgent caregiver support.',
                'description_mm' => 'ဆေးဝါး၊ ဆရာဝန်ပြသမှုနှင့် အရေးပေါ် စောင့်ရှောက်မှု။',
                'unit_cost' => 10000,
                'total_raised' => 0,
                'is_active' => true,
            ],
            [
                'title_mm' => 'အဝတ်အစား / အဖုံးအကာ',
                'title_en' => 'Clothing & Blankets',
                'description' => 'Warm blankets, clothing, and essential comfort kits.',
                'description_mm' => 'နွေးထွေးသော စောင်၊ အဝတ်အစားနှင့် လိုအပ်သော ပစ္စည်းများ။',
                'unit_cost' => 15000,
                'total_raised' => 0,
                'is_active' => true,
            ],
            [
                'title_mm' => 'အထွေထွေ လမ်းဘေးထောက်ပံ့မှု',
                'title_en' => 'General Outreach',
                'description' => 'Flexible support for urgent street outreach needs.',
                'description_mm' => 'အရေးပေါ် လမ်းဘေးကူညီရေးအတွက် လိုအပ်သလို သုံးနိုင်သော ရန်ပုံငွေ။',
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
