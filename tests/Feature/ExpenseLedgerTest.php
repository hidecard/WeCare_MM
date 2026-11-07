<?php

use App\Models\Donation;
use App\Models\Expense;
use App\Models\FundPool;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('lets an admin record an expense against a fund pool and archive it without deleting history', function () {
    Storage::fake('local');

    $admin = User::factory()->admin()->create();
    $pool = FundPool::query()->where('title_en', 'Daily Meals')->firstOrFail();

    Donation::query()->create([
        'fund_pool_id' => $pool->id,
        'donor_name' => 'Income Donor',
        'amount' => 20000,
        'payment_method' => 'KBZPay',
        'status' => 'approved',
        'approved_at' => now(),
        'tracking_token' => str_repeat('a', 64),
    ]);

    $this->actingAs($admin)
        ->post(route('admin.expenses.store'), [
            'fund_pool_id' => $pool->id,
            'category' => 'food',
            'amount' => 5000,
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->toDateString(),
            'reviewer_id' => $admin->id,
            'note' => 'Market rice and oil',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ])
        ->assertRedirect();

    $expense = Expense::query()->firstOrFail();
    expect($expense->fund_pool_id)->toBe($pool->id)
        ->and($expense->reviewer_id)->toBe($admin->id)
        ->and($expense->archived_at)->toBeNull();
    Storage::disk('local')->assertExists($expense->receipt_path);

    $this->get(route('admin.expenses.receipt', $expense))->assertOk();

    $this->get(route('admin.expenses.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Expenses')
            ->where('comparison.income', 20000)
            ->where('comparison.expenses', 5000)
            ->where('comparison.balance', 15000)
            ->where('comparison.by_pool', function ($pools) use ($pool): bool {
                $match = collect($pools)->firstWhere('id', $pool->id);

                return $match
                    && (float) $match['income'] === 20000.0
                    && (float) $match['expenses'] === 5000.0;
            }));

    $this->patch(route('admin.expenses.archive', $expense))->assertRedirect();
    $expense->refresh();
    expect($expense->archived_at)->not->toBeNull();
    $this->assertDatabaseHas('expenses', ['id' => $expense->id]);

    $this->get(route('admin.expenses.index'))
        ->assertInertia(fn ($page) => $page
            ->where('comparison.expenses', 0)
            ->where('comparison.balance', 20000)
            ->has('expenses.data', 0));

    $this->get(route('admin.expenses.index', ['archived' => 1]))
        ->assertInertia(fn ($page) => $page->has('expenses.data', 1));
});

it('keeps the expense ledger limited to administrators', function () {
    $pool = FundPool::query()->firstOrFail();

    $this->get(route('admin.expenses.index'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->post(route('admin.expenses.store'), [
            'fund_pool_id' => $pool->id,
            'category' => 'food',
            'amount' => 1000,
            'reviewer_id' => User::factory()->admin()->create()->id,
        ])
        ->assertForbidden();
});
