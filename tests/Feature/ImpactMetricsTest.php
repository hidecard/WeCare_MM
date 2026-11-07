<?php

use App\Models\Donation;
use App\Models\Expense;
use App\Models\FundPool;
use App\Models\OutreachTrip;
use App\Models\SpotReport;
use App\Models\User;

it('shows approved donations, expenses, trips, and resolved reports from stored records', function () {
    $pool = FundPool::query()->where('title_en', 'Daily Meals')->firstOrFail();
    $admin = User::factory()->admin()->create();

    Donation::query()->create([
        'fund_pool_id' => $pool->id,
        'donor_name' => 'Approved Donor',
        'amount' => 12000,
        'payment_method' => 'KBZPay',
        'status' => 'approved',
        'approved_at' => now(),
        'tracking_token' => str_repeat('c', 64),
    ]);

    Donation::query()->create([
        'fund_pool_id' => $pool->id,
        'donor_name' => 'Pending Donor',
        'amount' => 9000,
        'payment_method' => 'KBZPay',
        'status' => 'pending',
        'tracking_token' => str_repeat('d', 64),
    ]);

    Expense::query()->create([
        'fund_pool_id' => $pool->id,
        'category' => 'food',
        'amount' => 3000,
        'period_start' => now()->toDateString(),
        'period_end' => now()->toDateString(),
        'reviewer_id' => $admin->id,
    ]);

    Expense::query()->create([
        'fund_pool_id' => $pool->id,
        'category' => 'transport',
        'amount' => 9000,
        'period_start' => now()->toDateString(),
        'reviewer_id' => $admin->id,
        'archived_at' => now(),
    ]);

    OutreachTrip::query()->create([
        'trip_date' => now()->toDateString(),
        'township' => 'Insein',
        'elderly_helped_count' => 4,
        'meals_distributed' => 4,
        'medical_aid_count' => 1,
        'total_spent' => 3000,
    ]);

    SpotReport::query()->create([
        'township' => 'Insein',
        'street_landmark' => 'Bus stop',
        'time_seen' => now(),
        'condition_note' => 'Needs a meal',
        'status' => 'resolved',
        'resolved_at' => now(),
    ]);

    $month = now()->format('Y-m');

    $this->get(route('impact'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Impact')
            ->where('financialSummary.approved_donations', 1)
            ->where('financialSummary.total_received', 12000)
            ->where('financialSummary.total_spent', 3000)
            ->where('financialSummary.current_balance', 9000)
            ->where('financialSummary.outreach_trips', 1)
            ->where('financialSummary.resolved_reports', 1)
            ->where('impact.total_elderly_helped', 4)
            ->has('monthlySummary', 6)
            ->where('monthlySummary', function ($months) use ($month): bool {
                $current = collect($months)->firstWhere('month', $month);

                return $current
                    && (float) $current['approved_amount'] === 12000.0
                    && $current['approved_count'] === 1
                    && (float) $current['expense_amount'] === 3000.0
                    && $current['trip_count'] === 1
                    && $current['resolved_reports'] === 1;
            }));
});
