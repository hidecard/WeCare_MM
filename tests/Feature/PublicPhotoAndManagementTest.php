<?php

use App\Models\OutreachTrip;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

it('omits trip photos that are not stored on the public disk', function () {
    Storage::fake('public');
    Storage::disk('public')->put('trip-photos/real.jpg', 'image');

    OutreachTrip::query()->create([
        'trip_date' => now()->toDateString(),
        'township' => 'Insein',
        'elderly_helped_count' => 1,
        'photos_json' => ['trip-photos/sample-1.jpg', 'trip-photos/real.jpg'],
    ]);

    $this->get(route('outreach'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('recentTrips.data.0.photos_json', ['trip-photos/real.jpg']));
});

it('renders the management page when lists are paginated', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.management'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Management')
            ->has('fundPools.data')
            ->has('volunteers.data'));
});
