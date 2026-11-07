<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\OutreachTrip;

class TripExpenseSync
{
    public function sync(OutreachTrip $trip, ?int $reviewerId = null, ?string $category = null): Expense
    {
        $expense = Expense::query()
            ->where('outreach_trip_id', $trip->id)
            ->where('is_trip_sync', true)
            ->first();

        $amount = (float) $trip->total_spent;
        $nextCategory = in_array($category, Expense::CATEGORIES, true)
            ? $category
            : ($expense?->category ?? 'other');

        if ($amount <= 0) {
            if ($expense && $expense->archived_at === null) {
                $expense->update(['archived_at' => now()]);
            }

            return $expense ?? new Expense;
        }

        $payload = [
            'outreach_trip_id' => $trip->id,
            'is_trip_sync' => true,
            'category' => $nextCategory,
            'amount' => $amount,
            'period_start' => $trip->trip_date,
            'period_end' => $trip->trip_date,
            'note' => filled($expense?->note) ? $expense->note : 'Outreach trip: '.$trip->township,
            'archived_at' => null,
        ];

        if ($expense) {
            $expense->update($payload);

            return $expense;
        }

        return Expense::query()->create([
            ...$payload,
            'reviewer_id' => $reviewerId,
        ]);
    }
}
