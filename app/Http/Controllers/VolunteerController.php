<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVolunteerRequest;
use App\Models\Volunteer;
use Illuminate\Http\RedirectResponse;

class VolunteerController extends Controller
{
    public function store(StoreVolunteerRequest $request): RedirectResponse
    {
        if (Volunteer::query()->where('phone', $request->input('phone'))->where('created_at', '>=', now()->subMinutes(30))->exists()) {
            return redirect()->back()->withErrors(['volunteer' => 'This phone number was submitted recently.']);
        }

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
