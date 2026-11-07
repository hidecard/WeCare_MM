<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('donations', 'reviewed_at')) {
            Schema::table('donations', function (Blueprint $table): void {
                $table->timestamp('reviewed_at')->nullable()->after('review_note');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('donations', 'reviewed_at')) {
            Schema::table('donations', function (Blueprint $table): void {
                $table->dropColumn('reviewed_at');
            });
        }
    }
};
