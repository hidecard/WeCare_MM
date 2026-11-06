<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spot_reports', function (Blueprint $table): void {
            $table->string('reference_code', 24)->nullable()->unique()->after('reporter_phone');
        });
    }

    public function down(): void
    {
        Schema::table('spot_reports', function (Blueprint $table): void {
            $table->dropUnique(['reference_code']);
            $table->dropColumn('reference_code');
        });
    }
};
