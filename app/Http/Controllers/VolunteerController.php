<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVolunteerRequest;
use App\Models\Volunteer;

class VolunteerController extends Controller
{
    public function store(StoreVolunteerRequest $request)
    {
        Volunteer::query()->create([
            'name' => $request->input('name'),
            'phone' => $request->input('phone'),
            'township' => $request->input('township'),
            'available_days' => $request->input('available_days'),
            'status' => $request->input('status', 'available'),
        ]);

        return redirect()->back()->with('success', 'Thank you for volunteering. We will contact you soon.');
    }
}
