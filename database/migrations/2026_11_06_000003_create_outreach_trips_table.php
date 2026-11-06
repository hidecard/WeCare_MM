<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outreach_trips', function (Blueprint $table) {
            $table->id();
            $table->date('trip_date');
            $table->string('township');
            $table->unsignedInteger('elderly_helped_count')->default(0);
            $table->unsignedInteger('meals_distributed')->default(0);
            $table->unsignedInteger('medical_aid_count')->default(0);
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->text('summary_note')->nullable();
            $table->json('photos_json')->nullable();
            $table->json('receipt_images_json')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outreach_trips');
    }
};
