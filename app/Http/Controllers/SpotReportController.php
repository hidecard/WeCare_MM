<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSpotReportRequest;
use App\Models\SpotReport;

class SpotReportController extends Controller
{
    public function store(StoreSpotReportRequest $request)
    {
        SpotReport::query()->create([
            'township' => $request->input('township'),
            'street_landmark' => $request->input('street_landmark'),
            'time_seen' => $request->input('time_seen'),
            'condition_note' => $request->input('condition_note'),
            'reporter_phone' => $request->input('reporter_phone'),
            'status' => 'unread',
        ]);

        return redirect()->back()->with('success', 'Your spot report has been sent to the field team for review.');
    }
}
