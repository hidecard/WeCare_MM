<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spot_reports', function (Blueprint $table): void {
            $table->string('urgency')->default('normal')->after('status');
            $table->string('assigned_to')->nullable()->after('urgency');
            $table->text('follow_up_note')->nullable()->after('assigned_to');
            $table->timestamp('resolved_at')->nullable()->after('follow_up_note');
        });
    }

    public function down(): void
    {
        Schema::table('spot_reports', function (Blueprint $table): void {
            $table->dropColumn(['urgency', 'assigned_to', 'follow_up_note', 'resolved_at']);
        });
    }
};
***
