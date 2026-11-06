<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDonationRequest;
use App\Models\Donation;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DonationController extends Controller
{
    public function store(StoreDonationRequest $request)
    {
        $validated = $request->validated();

        $donorName = ($validated['is_anonymous'] ?? false)
            ? 'Anonymous donor'
            : (trim((string) ($validated['donor_name'] ?? '')) ?: 'Anonymous donor');

        $file = $request->file('slip_image');
        $path = $file ? Storage::disk('public')->putFileAs('slips', $file, $this->makeUniqueFilename($file)) : null;

        $certificateCode = $this->generateCertificateCode();

        Donation::query()->create([
            'fund_pool_id' => $validated['fund_pool_id'],
            'donor_name' => $donorName,
            'is_anonymous' => (bool) ($validated['is_anonymous'] ?? false),
            'phone' => $validated['phone'] ?? null,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'slip_image_path' => $path,
            'wish_note' => $validated['wish_note'] ?? null,
            'status' => 'pending',
            'certificate_code' => $certificateCode,
        ]);

        return redirect()->back()->with('success', 'Thank you. Your donation has been received and is being reviewed by our outreach team.');
    }

    public function downloadCertificate(Donation $donation)
    {
        if ($donation->status !== 'approved' || empty($donation->certificate_code)) {
            abort(404, 'Certificate not available yet.');
        }

        $content = sprintf(
            "WeCare Myanmar Charity Certificate\n\nCertificate Code: %s\nDonor: %s\nAmount: %s MMK\nPayment Method: %s\nApproved At: %s\n\nThank you for supporting dignified street outreach across Myanmar.",
            $donation->certificate_code,
            $donation->is_anonymous ? 'Anonymous donor' : $donation->donor_name,
            number_format((float) $donation->amount, 0),
            $donation->payment_method,
            $donation->approved_at ? $donation->approved_at->format('Y-m-d H:i:s') : 'N/A',
        );

        return response()->streamDownload(function () use ($content) {
            echo $content;
        }, 'wecare-certificate-'.$donation->certificate_code.'.txt', [
            'Content-Type' => 'text/plain; charset=utf-8',
        ]);
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
