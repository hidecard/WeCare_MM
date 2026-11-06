<?php

use App\Models\Donation;
use App\Models\FundPool;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('completes payment method CRUD and allows donors to submit with a custom method', function () {
    Storage::fake('public');
    Storage::fake('local');
    PaymentMethod::query()->delete();

    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $this->get(route('admin.payment-methods.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/PaymentMethods')
            ->has('paymentMethods', 0));

    $this->post(route('admin.payment-methods.store'), [
        'name' => 'MABPay',
        'account_name' => 'WeCare Myanmar',
        'account_number' => '09987654321',
        'is_active' => true,
        'sort_order' => 1,
        'qr_image' => UploadedFile::fake()->image('mabpay.png'),
    ])->assertRedirect();

    $method = PaymentMethod::query()->where('name', 'MABPay')->firstOrFail();
    expect($method->qr_image_path)->not->toBeNull();
    Storage::disk('public')->assertExists($method->qr_image_path);

    $pool = FundPool::query()->create([
        'title_mm' => 'အထွေထွေရန်ပုံငွေ',
        'title_en' => 'General Support',
        'unit_cost' => 5000,
        'is_active' => true,
    ]);

    $this->post(route('donations.store'), [
        'fund_pool_id' => $pool->id,
        'amount' => 15000,
        'payment_method' => 'MABPay',
        'donor_name' => 'Payment Method Tester',
        'phone' => '09912340000',
        'is_anonymous' => false,
        'slip_image' => UploadedFile::fake()->image('slip.jpg'),
    ])->assertRedirect()->assertSessionHas('donation_receipt');

    expect(Donation::query()->where('payment_method', 'MABPay')->exists())->toBeTrue();

    $oldQrPath = $method->qr_image_path;
    $this->patch(route('admin.payment-methods.update', $method), [
        'name' => 'MAB Pay',
        'account_name' => 'WeCare Outreach',
        'account_number' => '09111222333',
        'is_active' => false,
        'sort_order' => 2,
        'remove_qr_image' => true,
    ])->assertRedirect();

    $method->refresh();
    expect($method->name)->toBe('MAB Pay')
        ->and($method->account_name)->toBe('WeCare Outreach')
        ->and($method->account_number)->toBe('09111222333')
        ->and($method->is_active)->toBeFalse()
        ->and($method->sort_order)->toBe(2)
        ->and($method->qr_image_path)->toBeNull();
    Storage::disk('public')->assertMissing($oldQrPath);

    $this->delete(route('admin.payment-methods.destroy', $method))->assertRedirect();
    $this->assertDatabaseMissing('payment_methods', ['id' => $method->id]);
});
