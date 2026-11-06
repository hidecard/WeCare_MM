<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fund_pool_id')->constrained('fund_pools')->cascadeOnDelete();
            $table->string('donor_name')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->string('phone')->nullable();
            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['KBZPay', 'WavePay', 'AYAPay', 'CBPay']);
            $table->string('slip_image_path')->nullable();
            $table->text('wish_note')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('certificate_code')->nullable()->unique();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
