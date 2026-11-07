<?php

use App\Models\Donation;
use App\Models\FundPool;
use App\Models\OutreachTrip;
use App\Models\PaymentMethod;
use App\Models\SpotReport;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('rejects a donation phone that does not start with 09', function () {
    $pool = FundPool::query()->create([
        'title_mm' => 'စမ်းသပ်ရန်ပုံငွေ',
        'title_en' => 'Phone Check Pool',
        'unit_cost' => 5000,
        'is_active' => true,
    ]);

    PaymentMethod::query()->create([
        'name' => 'PhoneCheckPay',
        'account_name' => 'WeCare Myanmar',
        'account_number' => '09123456789',
        'is_active' => true,
        'sort_order' => 0,
    ]);

    $this->post(route('donations.store'), [
        'fund_pool_id' => $pool->id,
        'amount' => 5000,
        'payment_method' => 'PhoneCheckPay',
        'phone' => '0812345678',
        'slip_image' => UploadedFile::fake()->image('slip.jpg'),
    ])->assertSessionHasErrors('phone');

    expect(Donation::query()->count())->toBe(0);
});

it('stores a spaced donation phone as digits', function () {
    $pool = FundPool::query()->create([
        'title_mm' => 'စမ်းသပ်ရန်ပုံငွေ',
        'title_en' => 'Phone Normalize Pool',
        'unit_cost' => 5000,
        'is_active' => true,
    ]);

    PaymentMethod::query()->create([
        'name' => 'PhoneNormalizePay',
        'account_name' => 'WeCare Myanmar',
        'account_number' => '09123456789',
        'is_active' => true,
        'sort_order' => 0,
    ]);

    $this->post(route('donations.store'), [
        'fund_pool_id' => $pool->id,
        'amount' => 5000,
        'payment_method' => 'PhoneNormalizePay',
        'phone' => '09 912 345 678',
        'slip_image' => UploadedFile::fake()->image('slip.jpg'),
    ])->assertRedirect();

    expect(Donation::query()->firstOrFail()->phone)->toBe('09912345678');
});

it('rejects a spot report phone that does not start with 09', function () {
    $this->post(route('spot-reports.store'), [
        'township' => 'Insein',
        'street_landmark' => 'Bus stop',
        'reporter_phone' => 'hello',
    ])->assertSessionHasErrors('reporter_phone');

    expect(SpotReport::query()->count())->toBe(0);
});

it('shares waiting donation and report counts with admins', function () {
    $pool = FundPool::query()->where('title_en', 'Daily Meals')->firstOrFail();

    Donation::query()->create([
        'fund_pool_id' => $pool->id,
        'donor_name' => 'Waiting Donor',
        'amount' => 4000,
        'payment_method' => 'KBZPay',
        'status' => 'pending',
        'tracking_token' => str_repeat('e', 64),
    ]);

    SpotReport::query()->create([
        'township' => 'Insein',
        'street_landmark' => 'Market',
        'time_seen' => now(),
        'condition_note' => 'Needs help',
        'status' => 'unread',
    ]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('adminQueue.pending_donations', 1)
            ->where('adminQueue.unread_reports', 1));

    auth()->logout();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('adminQueue', null));
});

it('publishes search details for public pages and keeps them off the admin area', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertSee('လမ်းဘေးရှိ သက်ကြီးရွယ်အိုများအတွက် အစားအစာ', false)
        ->assertSee('og:title', false)
        ->assertSee('NGO', false)
        ->assertSee('index, follow', false);

    $this->get(route('donate'))
        ->assertOk()
        ->assertSee('ရန်ပုံငွေရွေးပါ၊ ပမာဏသတ်မှတ်ပါ', false)
        ->assertSee('index, follow', false);

    $this->get(route('donations.status-page'))
        ->assertOk()
        ->assertSee('noindex, nofollow', false)
        ->assertSee('လှူဒါန်းမှုအမှတ်ဖြင့် အတည်ပြုချက်', false);

    $this->get('/missing-public-page')
        ->assertNotFound()
        ->assertSee('ရှာနေသော စာမျက်နှာကို ဖွင့်၍မရပါ', false)
        ->assertSee('noindex, nofollow', false);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertDontSee('လမ်းဘေးရှိ သက်ကြီးရွယ်အိုများအတွက် အစားအစာ', false);
});

it('shows a myanmar fund description and every outreach photo', function () {
    Storage::fake('public');
    Storage::disk('public')->put('trip-photos/one.jpg', 'one');
    Storage::disk('public')->put('trip-photos/two.jpg', 'two');

    OutreachTrip::query()->create([
        'trip_date' => now()->toDateString(),
        'township' => 'Insein',
        'elderly_helped_count' => 2,
        'meals_distributed' => 2,
        'medical_aid_count' => 0,
        'total_spent' => 1000,
        'photos_json' => ['trip-photos/one.jpg', 'trip-photos/two.jpg'],
    ]);

    $this->get(route('donate'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('fundPools', function ($pools): bool {
            $medical = collect($pools)->firstWhere('title_en', 'Emergency Medical');

            return is_array($medical) && str_contains((string) ($medical['description_mm'] ?? ''), 'ဆေးဝါး');
        }));

    $this->get(route('outreach'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('recentTrips.0.photos_json', [
            'trip-photos/one.jpg',
            'trip-photos/two.jpg',
        ]));
});

it('lists pending donations with a phone before older donations without one', function () {
    $pool = FundPool::query()->where('title_en', 'Daily Meals')->firstOrFail();

    $older = Donation::query()->create([
        'fund_pool_id' => $pool->id,
        'donor_name' => 'Older donor',
        'amount' => 4000,
        'payment_method' => 'KBZPay',
        'status' => 'pending',
        'tracking_token' => str_repeat('a', 64),
    ]);
    $older->forceFill(['created_at' => now()->subDays(2)])->save();

    $newer = Donation::query()->create([
        'fund_pool_id' => $pool->id,
        'donor_name' => 'Phone donor',
        'phone' => '09912345678',
        'amount' => 5000,
        'payment_method' => 'KBZPay',
        'status' => 'pending',
        'tracking_token' => str_repeat('b', 64),
    ]);
    $newer->forceFill(['created_at' => now()])->save();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.donations.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('pendingDonations.data.0.donor_name', 'Phone donor'));
});
