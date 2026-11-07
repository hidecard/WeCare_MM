<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('outreach_trip_id')->nullable()->after('fund_pool_id')->constrained('outreach_trips')->nullOnDelete();
            $table->boolean('is_trip_sync')->default(false)->after('outreach_trip_id');
        });

        $now = now();

        DB::table('outreach_trips')
            ->where('total_spent', '>', 0)
            ->orderBy('id')
            ->get()
            ->each(function (object $trip) use ($now): void {
                $alreadySynced = DB::table('expenses')
                    ->where('outreach_trip_id', $trip->id)
                    ->where('is_trip_sync', true)
                    ->exists();

                if ($alreadySynced) {
                    return;
                }

                DB::table('expenses')->insert([
                    'outreach_trip_id' => $trip->id,
                    'is_trip_sync' => true,
                    'category' => 'other',
                    'amount' => $trip->total_spent,
                    'period_start' => $trip->trip_date,
                    'period_end' => $trip->trip_date,
                    'note' => 'Outreach trip: '.$trip->township,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('outreach_trip_id');
            $table->dropColumn('is_trip_sync');
        });
    }
};
