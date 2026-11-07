<?php

use App\Models\Expense;
use App\Models\OutreachTrip;
use App\Models\User;

it('copies a trip cost into the expense ledger and shows that amount publicly', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.outreach-trips.store'), [
        'trip_date' => now()->toDateString(),
        'township' => 'Thaketa',
        'elderly_helped_count' => 3,
        'meals_distributed' => 6,
        'medical_aid_count' => 1,
        'total_spent' => 15000,
        'summary_note' => 'Meals and medicine',
    ])->assertRedirect();

    $trip = OutreachTrip::query()->firstOrFail();
    $expense = Expense::query()->where('outreach_trip_id', $trip->id)->where('is_trip_sync', true)->firstOrFail();

    expect((float) $expense->amount)->toBe(15000.0)
        ->and($expense->period_start?->toDateString())->toBe(now()->toDateString())
        ->and($expense->archived_at)->toBeNull();

    $this->get(route('impact'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('financialSummary.total_spent', 15000)
            ->where('recentTrips.0.ledger_spent', fn ($spent): bool => (float) $spent === 15000.0));

    $this->actingAs($admin)->patch(route('admin.outreach-trips.update', $trip), [
        'trip_date' => now()->toDateString(),
        'township' => 'Thaketa',
        'elderly_helped_count' => 3,
        'meals_distributed' => 6,
        'medical_aid_count' => 1,
        'total_spent' => 0,
    ])->assertRedirect();

    expect($expense->refresh()->archived_at)->not->toBeNull();
    expect((float) Expense::query()->active()->sum('amount'))->toBe(0.0);
});

it('stores the chosen trip expense category in the ledger', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.outreach-trips.store'), [
        'trip_date' => now()->toDateString(),
        'township' => 'Insein',
        'elderly_helped_count' => 2,
        'meals_distributed' => 0,
        'medical_aid_count' => 2,
        'total_spent' => 8000,
        'expense_category' => 'medicine',
    ])->assertRedirect();

    $trip = OutreachTrip::query()->where('township', 'Insein')->firstOrFail();

    expect(Expense::query()->where('outreach_trip_id', $trip->id)->where('is_trip_sync', true)->value('category'))->toBe('medicine');
});
