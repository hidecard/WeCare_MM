<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Expense;
use App\Models\FundPool;
use App\Models\OutreachTrip;
use App\Models\PaymentMethod;
use App\Models\SpotReport;
use App\Models\Volunteer;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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
            'monthlySummary' => $data['monthlySummary'],
            'expenseBreakdown' => $this->expenseBreakdown(),
            'dataFreshness' => $data['dataFreshness'],
        ]);
    }

    public function leaderboard(Request $request)
    {
        $search = trim((string) $request->input('search', ''));

        $query = Donation::query()
            ->where('status', 'approved')
            ->selectRaw("COALESCE(NULLIF(donor_name, ''), 'Anonymous donor') as name, SUM(amount) as total, COUNT(*) as gifts")
            ->groupBy('name')
            ->orderByDesc('total');

        if ($search !== '') {
            $query->having('name', 'like', '%'.$search.'%');
        }

        $donors = $query->paginate(20)->withQueryString();

        return Inertia::render('Leaderboard', [
            'donors' => $donors,
            'search' => $search,
        ]);
    }

    public function volunteerLeaderboard()
    {
        $volunteers = Volunteer::query()
            ->selectRaw('name, township, COUNT(*) as reports')
            ->groupBy('name', 'township')
            ->orderByDesc('reports')
            ->paginate(20);

        return Inertia::render('VolunteerLeaderboard', [
            'volunteers' => $volunteers,
        ]);
    }

    public function monthlyReport(Request $request)
    {
        $month = $request->validate(['month' => ['nullable', 'date_format:Y-m']])['month'] ?? now()->format('Y-m');
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $donations = Donation::query()->where('status', 'approved')->whereBetween('approved_at', [$start, $end])->get(['amount']);
        $expenses = Expense::query()->active()->where(function ($query) use ($start, $end): void {
            $query->whereBetween('period_start', [$start->toDateString(), $end->toDateString()])
                ->orWhere(function ($nested) use ($start, $end): void {
                    $nested->whereNull('period_start')->whereBetween('created_at', [$start, $end]);
                });
        })->get(['category', 'amount']);
        $trips = OutreachTrip::query()->whereBetween('trip_date', [$start->toDateString(), $end->toDateString()])->get(['elderly_helped_count', 'meals_distributed', 'medical_aid_count', 'township']);
        $resolvedReports = SpotReport::query()->where('status', 'resolved')->whereBetween('resolved_at', [$start, $end])->count();

        return Inertia::render('MonthlyImpact', [
            'report' => [
                'month' => $month,
                'label' => $start->format('F Y'),
                'approved_amount' => (float) $donations->sum('amount'),
                'approved_count' => $donations->count(),
                'expense_amount' => (float) $expenses->sum('amount'),
                'expense_breakdown' => $expenses->groupBy('category')->map(fn ($rows, $category): array => ['category' => $category, 'amount' => (float) $rows->sum('amount')])->values()->all(),
                'trip_count' => $trips->count(),
                'elderly_helped' => (int) $trips->sum('elderly_helped_count'),
                'meals_distributed' => (int) $trips->sum('meals_distributed'),
                'medical_aid' => (int) $trips->sum('medical_aid_count'),
                'townships_reached' => $trips->pluck('township')->filter()->unique()->values()->all(),
                'resolved_reports' => $resolvedReports,
                'last_updated_at' => $this->dataFreshness(),
            ],
            'availableMonths' => collect(range(11, 0))->map(fn (int $offset): string => now()->startOfMonth()->subMonths($offset)->format('Y-m'))->all(),
        ]);
    }

    public function outreach(Request $request)
    {
        $filters = $request->validate([
            'township' => ['nullable', 'string', 'max:255'],
            'month' => ['nullable', 'date_format:Y-m'],
        ]);

        return Inertia::render('Outreach', [
            'recentTrips' => OutreachTrip::query()
                ->withSum(['expenses as ledger_spent' => fn ($query) => $query->whereNull('archived_at')], 'amount')
                ->when($filters['township'] ?? null, fn ($query, $township) => $query->where('township', $township))
                ->when($filters['month'] ?? null, fn ($query, $month) => $query->where('trip_date', 'like', $month.'%'))
                ->latest('trip_date')
                ->paginate(6)
                ->withQueryString(),
            'townships' => OutreachTrip::query()->select('township')->distinct()->orderBy('township')->pluck('township')->values(),
            'filters' => [
                'township' => $filters['township'] ?? 'all',
                'month' => $filters['month'] ?? '',
            ],
        ]);
    }

    public function community()
    {
        return Inertia::render('Community');
    }

    public function about()
    {
        return Inertia::render('About');
    }

    public function help()
    {
        return Inertia::render('HelpCenter');
    }

    public function privacyPolicy()
    {
        return Inertia::render('PrivacyPolicy');
    }

    public function terms()
    {
        return Inertia::render('Terms');
    }

    public function dataHandling()
    {
        return Inertia::render('DataHandling');
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
            ->withSum(['expenses as ledger_spent' => fn ($query) => $query->whereNull('archived_at')], 'amount')
            ->latest('trip_date')
            ->take(5)
            ->get();

        $approvedAmount = (float) Donation::query()->where('status', 'approved')->sum('amount');
        $expenseAmount = (float) Expense::query()->active()->sum('amount');

        $financialSummary = [
            'total_received' => $approvedAmount,
            'total_spent' => $expenseAmount,
            'current_balance' => $approvedAmount - $expenseAmount,
            'approved_donations' => Donation::query()->where('status', 'approved')->count(),
            'expense_count' => Expense::query()->active()->count(),
            'outreach_trips' => OutreachTrip::query()->count(),
            'resolved_reports' => SpotReport::query()->where('status', 'resolved')->count(),
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
            'monthlySummary' => $this->monthlySummary(),
            'dataFreshness' => $this->dataFreshness(),
        ];
    }

    protected function dataFreshness(): ?string
    {
        $latest = collect([
            Donation::query()->where('status', 'approved')->max('updated_at'),
            Expense::query()->active()->max('updated_at'),
            OutreachTrip::query()->max('updated_at'),
            SpotReport::query()->where('status', 'resolved')->max('updated_at'),
        ])->filter()->max();

        return $latest ? Carbon::parse($latest)->toIso8601String() : null;
    }

    /**
     * @return array<int, array{category: string, amount: float}>
     */
    protected function expenseBreakdown(): array
    {
        $totals = Expense::query()
            ->active()
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->pluck('total', 'category');

        return collect(Expense::CATEGORIES)
            ->map(fn (string $category): array => [
                'category' => $category,
                'amount' => (float) ($totals[$category] ?? 0),
            ])
            ->filter(fn (array $row): bool => $row['amount'] > 0)
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{month: string, label: string, approved_amount: float, approved_count: int, expense_amount: float, trip_count: int, resolved_reports: int}>
     */
    protected function monthlySummary(): array
    {
        $months = collect(range(5, 0))->map(fn (int $offset): Carbon => now()->startOfMonth()->subMonths($offset));
        $from = $months->first();

        $donations = Donation::query()
            ->where('status', 'approved')
            ->where('approved_at', '>=', $from)
            ->get(['approved_at', 'amount']);

        $expenses = Expense::query()
            ->active()
            ->where(function ($query) use ($from): void {
                $query->where('period_start', '>=', $from->toDateString())
                    ->orWhere(function ($nested) use ($from): void {
                        $nested->whereNull('period_start')->where('created_at', '>=', $from);
                    });
            })
            ->get(['period_start', 'created_at', 'amount']);

        $trips = OutreachTrip::query()
            ->where('trip_date', '>=', $from->toDateString())
            ->get(['trip_date']);

        $reports = SpotReport::query()
            ->where('status', 'resolved')
            ->where('resolved_at', '>=', $from)
            ->get(['resolved_at']);

        return $months->map(function (Carbon $month) use ($donations, $expenses, $trips, $reports): array {
            $key = $month->format('Y-m');
            $approved = $donations->filter(fn (Donation $donation): bool => $donation->approved_at?->format('Y-m') === $key);
            $monthExpenses = $expenses->filter(function (Expense $expense) use ($key): bool {
                $date = $expense->period_start ?? $expense->created_at;

                return $date?->format('Y-m') === $key;
            });

            return [
                'month' => $key,
                'label' => $month->format('M Y'),
                'approved_amount' => (float) $approved->sum('amount'),
                'approved_count' => $approved->count(),
                'expense_amount' => (float) $monthExpenses->sum('amount'),
                'trip_count' => $trips->filter(fn (OutreachTrip $trip): bool => $trip->trip_date?->format('Y-m') === $key)->count(),
                'resolved_reports' => $reports->filter(fn (SpotReport $report): bool => $report->resolved_at?->format('Y-m') === $key)->count(),
            ];
        })->values()->all();
    }
}
