<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fund_pools', function (Blueprint $table) {
            $table->string('description_mm')->nullable()->after('description');
        });

        $descriptions = [
            'Daily Meals' => 'လမ်းဘေးရှိ သက်ကြီးရွယ်အိုများအတွက် နွေးထွေးသော အစားအစာနှင့် အခြေခံစောင့်ရှောက်မှု။',
            'Emergency Medical' => 'ဆေးဝါး၊ ဆရာဝန်ပြသမှုနှင့် အရေးပေါ် စောင့်ရှောက်မှု။',
            'Clothing & Blankets' => 'နွေးထွေးသော စောင်၊ အဝတ်အစားနှင့် လိုအပ်သော ပစ္စည်းများ။',
            'General Outreach' => 'အရေးပေါ် လမ်းဘေးကူညီရေးအတွက် လိုအပ်သလို သုံးနိုင်သော ရန်ပုံငွေ။',
        ];

        foreach ($descriptions as $title => $description) {
            DB::table('fund_pools')
                ->where('title_en', $title)
                ->whereNull('description_mm')
                ->update(['description_mm' => $description]);
        }
    }

    public function down(): void
    {
        Schema::table('fund_pools', function (Blueprint $table) {
            $table->dropColumn('description_mm');
        });
    }
};
