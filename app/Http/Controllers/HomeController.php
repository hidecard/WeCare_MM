<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\FundPool;
use App\Models\OutreachTrip;
use Illuminate\Http\Request;
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
            'recentDonations' => $recentDonations,
            'recentTrips' => $recentTrips,
            'financialSummary' => $financialSummary,
        ];
    }
}
