<?php

use App\Models\Donation;
use App\Models\FundPool;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('provides the legacy payment options on the public donation page after migration', function () {
    $this->get(route('donate'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Donate')
            ->where('paymentDetails.KBZPay.phone', '09 123 456 789')
            ->where('paymentDetails.WavePay.phone', '09 987 654 321'));
});

it('lets a donor track a submitted donation and access the certificate after approval', function () {
    Storage::fake('local');

    $pool = FundPool::query()->create([
        'title_mm' => 'အထွေထွေရန်ပုံငွေ',
        'title_en' => 'General Support',
        'unit_cost' => 5000,
        'is_active' => true,
    ]);

    PaymentMethod::query()->create([
        'name' => 'ReceiptPay',
        'account_name' => 'WeCare Myanmar',
        'account_number' => '09123456789',
        'is_active' => true,
        'sort_order' => 0,
    ]);

    $this->post(route('donations.store'), [
        'fund_pool_id' => $pool->id,
        'amount' => 25000,
        'payment_method' => 'ReceiptPay',
        'donor_name' => 'Test Donor',
        'phone' => '09912345678',
        'is_anonymous' => false,
        'slip_image' => UploadedFile::fake()->image('slip.jpg'),
    ])->assertRedirect()->assertSessionHas('donation_receipt', function (array $receipt): bool {
        return $receipt['donor_name'] === 'Test Donor'
            && $receipt['amount'] === '25000.00'
            && $receipt['status'] === 'pending'
            && strlen($receipt['tracking_token']) === 64;
    });

    $donation = Donation::query()->firstOrFail();
    $this->getJson(route('donations.status', $donation->tracking_token))
        ->assertOk()
        ->assertJsonPath('status', 'pending')
        ->assertJsonPath('donor_name', 'Test Donor')
        ->assertJsonPath('amount', '25000.00')
        ->assertJsonPath('certificate_url', null);

    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin)
        ->patch(route('admin.donations.update-status', $donation), ['status' => 'approved'])
        ->assertRedirect();

    $donation->refresh();
    expect($donation->certificate_code)->not->toBeNull();

    $statusResponse = $this->getJson(route('donations.status', $donation->tracking_token))
        ->assertOk()
        ->assertJsonPath('status', 'approved')
        ->assertJsonPath('donor_name', 'Test Donor')
        ->assertJsonPath('amount', '25000.00');

    $certificateUrl = $statusResponse->json('certificate_url');
    expect($certificateUrl)->not->toBeNull();

    $this->get($certificateUrl)
        ->assertOk()
        ->assertSee('Test Donor')
        ->assertSee('25,000 MMK')
        ->assertSee('Print / Save as PDF');
});

it('does not disclose donation status for an invalid tracking token', function () {
    $this->getJson(route('donations.status', str_repeat('x', 64)))
        ->assertNotFound();
});
