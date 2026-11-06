<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fund_pools', function (Blueprint $table) {
            $table->id();
            $table->string('title_mm');
            $table->string('title_en');
            $table->text('description')->nullable();
            $table->unsignedInteger('unit_cost')->default(5000);
            $table->decimal('total_raised', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fund_pools');
    }
};
