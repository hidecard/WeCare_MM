<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSpotReportRequest;
use App\Models\SpotReport;
use Illuminate\Http\RedirectResponse;

class SpotReportController extends Controller
{
    public function store(StoreSpotReportRequest $request): RedirectResponse
    {
        $duplicate = SpotReport::query()
            ->where('township', $request->input('township'))
            ->where('street_landmark', $request->input('street_landmark'))
            ->where('condition_note', $request->input('condition_note'))
            ->where('created_at', '>=', now()->subMinutes(10))
            ->exists();

        if ($duplicate) {
            return redirect()->back()->withErrors(['spot_report' => 'A matching report was already submitted recently.']);
        }

        SpotReport::query()->create([
            'township' => $request->input('township'),
            'street_landmark' => $request->input('street_landmark'),
            'time_seen' => $request->input('time_seen'),
            'condition_note' => $request->input('condition_note'),
            'reporter_phone' => $request->input('reporter_phone'),
            'status' => 'unread',
            'urgency' => 'normal',
        ]);

        return redirect()->back()->with('success', 'Your spot report has been sent to the field team for review.');
    }
}
