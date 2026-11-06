<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDonationRequest;
use App\Models\Donation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class DonationController extends Controller
{
    public function store(StoreDonationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (! empty($validated['phone']) && Donation::query()
            ->where('phone', $validated['phone'])
            ->where('amount', $validated['amount'])
            ->where('payment_method', $validated['payment_method'])
            ->where('created_at', '>=', now()->subMinutes(10))
            ->exists()) {
            return redirect()->back()->withErrors(['donation' => 'A matching donation was submitted recently.']);
        }

        $donorName = ($validated['is_anonymous'] ?? false)
            ? 'Anonymous donor'
            : (trim((string) ($validated['donor_name'] ?? '')) ?: 'Anonymous donor');

        $file = $request->file('slip_image');
        $path = $file ? Storage::disk('local')->putFileAs('slips', $file, $this->makeUniqueFilename($file)) : null;

        $donation = Donation::query()->create([
            'fund_pool_id' => $validated['fund_pool_id'],
            'donor_name' => $donorName,
            'is_anonymous' => (bool) ($validated['is_anonymous'] ?? false),
            'phone' => $validated['phone'] ?? null,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'slip_image_path' => $path,
            'wish_note' => $validated['wish_note'] ?? null,
            'status' => 'pending',
            'certificate_code' => null,
            'tracking_token' => Str::random(64),
        ]);

        return redirect()->back()
            ->with('success', 'Thank you. Your donation has been received and is being reviewed by our outreach team.')
            ->with('donation_receipt', [
                'tracking_token' => $donation->tracking_token,
                'donor_name' => $donation->donor_name,
                'amount' => (string) $donation->amount,
                'status' => $donation->status,
            ]);
    }

    public function status(string $trackingToken): Response
    {
        $donation = Donation::query()
            ->where('tracking_token', $trackingToken)
            ->firstOrFail();

        return response()->json([
            'status' => $donation->status,
            'donor_name' => $donation->is_anonymous ? 'Anonymous donor' : $donation->donor_name,
            'amount' => (string) $donation->amount,
            'certificate_url' => $donation->status === 'approved' && $donation->certificate_code
                ? route('donations.certificate', [
                    'donation' => $donation->id,
                    'certificateCode' => $donation->certificate_code,
                ])
                : null,
        ]);
    }

    public function downloadCertificate(Donation $donation, string $certificateCode)
    {
        if ($donation->status !== 'approved' || empty($donation->certificate_code) || ! hash_equals($donation->certificate_code, $certificateCode)) {
            abort(404, 'Certificate not available yet.');
        }

        return response()->view('certificates.donation', [
            'donation' => $donation,
        ])->header('Content-Type', 'text/html; charset=UTF-8');
    }

    protected function makeUniqueFilename($file): string
    {
        $extension = $file->getClientOriginalExtension();

        return 'slip-'.Str::uuid().'.'.$extension;
    }

    protected function generateCertificateCode(): string
    {
        do {
            $code = 'WC-'.Str::upper(Str::random(8));
        } while (Donation::query()->where('certificate_code', $code)->exists());

        return $code;
    }
}
