<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * This migration was deployed with legacy hard-coded account numbers that
     * are not verified receiving accounts. Keep the migration identifier for
     * environments where it already ran; migration 000013 disables those rows.
     */
    public function up(): void
    {
        // Intentionally do not seed unverified payment account details.
    }

    public function down(): void
    {
        // Intentionally preserve any payment records that an administrator configured.
    }
};
