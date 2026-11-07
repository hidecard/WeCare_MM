<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('fund_pool_id')->nullable()->after('id')->constrained('fund_pools')->nullOnDelete();
            $table->text('note')->nullable()->after('reviewer_id');
            $table->timestamp('archived_at')->nullable()->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('fund_pool_id');
            $table->dropColumn(['note', 'archived_at']);
        });
    }
};
