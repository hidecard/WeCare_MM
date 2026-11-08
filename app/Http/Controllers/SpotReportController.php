<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSpotReportRequest;
use App\Models\SpotReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SpotReportController extends Controller
{
    public function store(StoreSpotReportRequest $request): RedirectResponse
    {
        $conditionNote = trim((string) $request->input('condition_note')) ?: 'Reported from the community form.';

        $duplicate = SpotReport::query()
            ->where('township', $request->input('township'))
            ->where('street_landmark', $request->input('street_landmark'))
            ->where('condition_note', $conditionNote)
            ->where('created_at', '>=', now()->subMinutes(10))
            ->exists();

        if ($duplicate) {
            return redirect()->back()->withErrors(['spot_report' => 'A matching report was already submitted recently.']);
        }

        $photo = $request->file('photo');

        $spotReport = SpotReport::query()->create([
            'township' => $request->input('township'),
            'street_landmark' => $request->input('street_landmark'),
            'time_seen' => $request->input('time_seen') ?: now(),
            'condition_note' => $conditionNote,
            'reporter_phone' => $request->input('reporter_phone'),
            'photo_path' => $photo ? $photo->store('spot-report-photos', 'local') : null,
            'reference_code' => $this->makeReferenceCode(),
            'status' => 'unread',
            'urgency' => 'normal',
        ]);

        return redirect()->back()
            ->with('success', 'Your spot report has been sent to the field team for review.')
            ->with('spot_report_reference', $spotReport->reference_code);
    }

    public function downloadPhoto(\Illuminate\Http\Request $request, SpotReport $spotReport): StreamedResponse
    {
        abort_unless($spotReport->photo_path && Storage::disk('local')->exists($spotReport->photo_path), 404);

        if ($request->boolean('inline')) {
            return Storage::disk('local')->response($spotReport->photo_path);
        }

        return Storage::disk('local')->download($spotReport->photo_path);
    }

    public function status(string $referenceCode): JsonResponse
    {
        $spotReport = SpotReport::query()
            ->where('reference_code', strtoupper($referenceCode))
            ->firstOrFail();

        return response()->json([
            'reference_code' => $spotReport->reference_code,
            'township' => $spotReport->township,
            'status' => $spotReport->status,
            'urgency' => $spotReport->urgency,
            'submitted_at' => $spotReport->created_at?->toIso8601String(),
            'follow_up_note' => $spotReport->follow_up_note,
        ]);
    }

    protected function makeReferenceCode(): string
    {
        do {
            $code = 'WR-'.Str::upper(Str::random(8));
        } while (SpotReport::query()->where('reference_code', $code)->exists());

        return $code;
    }
}
