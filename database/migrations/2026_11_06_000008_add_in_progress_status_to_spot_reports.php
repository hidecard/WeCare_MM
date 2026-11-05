<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE spot_reports MODIFY status ENUM('unread', 'checked', 'in_progress', 'resolved') NOT NULL DEFAULT 'unread'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("UPDATE spot_reports SET status = 'checked' WHERE status = 'in_progress'");
            DB::statement("ALTER TABLE spot_reports MODIFY status ENUM('unread', 'checked', 'resolved') NOT NULL DEFAULT 'unread'");
        }
    }
};
