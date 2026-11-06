<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\FundPool;
use App\Models\OutreachTrip;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $data = $this->baseData();

        return Inertia::render('Home', $data);
    }

    public function donate()
    {
        $data = $this->baseData();

        return Inertia::render('Donate', [
            'fundPools' => $data['fundPools'],
            'paymentDetails' => $data['paymentDetails'],
        ]);
    }

    public function impact()
    {
        $data = $this->baseData();

        return Inertia::render('Impact', [
            'impact' => $data['impact'],
            'financialSummary' => $data['financialSummary'],
            'recentTrips' => $data['recentTrips'],
        ]);
    }

    public function outreach()
    {
        $data = $this->baseData();

        return Inertia::render('Outreach', [
            'recentTrips' => $data['recentTrips'],
        ]);
    }

    public function community()
    {
        return Inertia::render('Community');
    }

    protected function baseData(): array
    {
        $impact = OutreachTrip::query()
            ->selectRaw('SUM(elderly_helped_count) as elderly_helped_count, SUM(meals_distributed) as meals_distributed, SUM(medical_aid_count) as medical_aid_count, COUNT(DISTINCT township) as townships_reached')
            ->first();

        $fundPools = FundPool::query()
            ->where('is_active', true)
            ->orderByDesc('total_raised')
            ->get();

        $paymentDetails = PaymentMethod::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->mapWithKeys(fn (PaymentMethod $method): array => [
                $method->name => [
                    'label' => $method->account_name ?: $method->name,
                    'phone' => $method->account_number,
                    'account_name' => $method->account_name,
                    'qr_url' => $method->qr_image_path ? Storage::disk('public')->url($method->qr_image_path) : null,
                ],
            ])
            ->all();

        $recentDonations = Donation::query()
            ->where('status', 'approved')
            ->with('fundPool')
            ->latest('approved_at')
            ->take(6)
            ->get();

        $recentTrips = OutreachTrip::query()
            ->latest('trip_date')
            ->take(5)
            ->get();

        $financialSummary = [
            'total_received' => (float) Donation::query()->where('status', 'approved')->sum('amount'),
            'total_spent' => (float) OutreachTrip::query()->sum('total_spent'),
            'current_balance' => (float) Donation::query()->where('status', 'approved')->sum('amount') - (float) OutreachTrip::query()->sum('total_spent'),
        ];

        return [
            'impact' => [
                'total_elderly_helped' => (int) ($impact->elderly_helped_count ?? 0),
                'meals_distributed' => (int) ($impact->meals_distributed ?? 0),
                'medical_aid_provided' => (int) ($impact->medical_aid_count ?? 0),
                'townships_reached' => (int) ($impact->townships_reached ?? 0),
            ],
            'fundPools' => $fundPools,
            'paymentDetails' => $paymentDetails,
            'recentDonations' => $recentDonations,
            'recentTrips' => $recentTrips,
            'financialSummary' => $financialSummary,
        ];
    }
}
