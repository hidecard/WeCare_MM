<?php

use App\Models\Donation;
use App\Models\FundPool;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Notifications\DonationReviewedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

it('emails the donor and shows the review reason on the tracking page', function () {
    Notification::fake();
    Storage::fake('local');

    $pool = FundPool::query()->firstOrFail();
    PaymentMethod::query()->create([
        'name' => 'ReviewPay',
        'account_name' => 'WeCare Myanmar',
        'account_number' => '09111111111',
        'is_active' => true,
        'sort_order' => 0,
    ]);

    $this->post(route('donations.store'), [
        'fund_pool_id' => $pool->id,
        'amount' => 12000,
        'payment_method' => 'ReviewPay',
        'donor_name' => 'Ma Hla',
        'donor_email' => 'donor@example.com',
        'phone' => '09900000001',
        'slip_image' => UploadedFile::fake()->image('slip.jpg'),
        'information_confirmed' => true,
    ])->assertRedirect();

    $donation = Donation::query()->firstOrFail();
    expect($donation->donor_email)->toBe('donor@example.com');

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->patch(route('admin.donations.update-status', $donation), ['status' => 'rejected'])
        ->assertSessionHasErrors('review_note');

    expect($donation->refresh()->status)->toBe('pending');

    $this->actingAs($admin)
        ->patch(route('admin.donations.update-status', $donation), [
            'status' => 'rejected',
            'review_note' => 'Slip amount does not match.',
        ])
        ->assertRedirect();

    $donation->refresh();
    expect($donation->status)->toBe('rejected')
        ->and($donation->review_note)->toBe('Slip amount does not match.');

    Notification::assertSentOnDemand(
        DonationReviewedNotification::class,
        function (DonationReviewedNotification $notification, array $channels, object $notifiable) use ($donation): bool {
            return $notifiable->routes['mail'] === 'donor@example.com'
                && $notification->status === 'rejected'
                && $notification->reviewNote === 'Slip amount does not match.'
                && str_contains($notification->trackingUrl, $donation->tracking_token)
                && in_array('mail', $channels, true);
        }
    );

    $this->getJson(route('donations.status', $donation->tracking_token))
        ->assertOk()
        ->assertJsonPath('status', 'rejected')
        ->assertJsonPath('review_note', 'Slip amount does not match.');
});

it('does not send a review email when the donor left no address', function () {
    Notification::fake();

    $pool = FundPool::query()->firstOrFail();
    $donation = Donation::query()->create([
        'fund_pool_id' => $pool->id,
        'donor_name' => 'No Email',
        'amount' => 8000,
        'payment_method' => 'KBZPay',
        'status' => 'pending',
        'tracking_token' => str_repeat('b', 64),
    ]);

    $this->actingAs(User::factory()->admin()->create())
        ->patch(route('admin.donations.update-status', $donation), [
            'status' => 'approved',
            'review_note' => 'Received, thank you.',
        ])
        ->assertRedirect();

    expect($donation->refresh()->status)->toBe('approved')
        ->and($donation->review_note)->toBe('Received, thank you.');

    Notification::assertNothingSent();
});
