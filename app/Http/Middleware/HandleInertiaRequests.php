<?php

namespace App\Http\Middleware;

use App\Models\Donation;
use App\Models\PaymentMethod;
use App\Models\SpotReport;
use App\Support\PublicSeo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'paymentDetails' => PaymentMethod::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->mapWithKeys(fn (PaymentMethod $method): array => [
                    $method->name => [
                        'phone' => $method->account_number,
                        'label' => $method->account_name ?: $method->name,
                        'account_name' => $method->account_name,
                        'qr_url' => $method->qr_image_path ? Storage::disk('public')->url($method->qr_image_path) : null,
                    ],
                ])
                ->all(),
            'auth' => [
                'user' => $request->user(),
            ],
            'adminQueue' => fn (): ?array => $request->user()?->isAdmin() ? [
                'pending_donations' => Donation::query()->where('status', 'pending')->count(),
                'unread_reports' => SpotReport::query()->where('status', 'unread')->count(),
            ] : null,
            'seo' => fn (): ?array => PublicSeo::forRequest($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'donation_receipt' => fn () => $request->session()->get('donation_receipt'),
            ],
        ];
    }
}
