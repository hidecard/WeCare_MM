<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spot_reports', function (Blueprint $table) {
            $table->id();
            $table->string('township');
            $table->string('street_landmark');
            $table->dateTime('time_seen');
            $table->text('condition_note');
            $table->string('reporter_phone')->nullable();
            $table->enum('status', ['unread', 'checked', 'resolved'])->default('unread');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spot_reports');
    }
};
