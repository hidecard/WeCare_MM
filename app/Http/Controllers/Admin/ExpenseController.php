<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Donation;
use App\Models\Expense;
use App\Models\FundPool;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $showArchived = $request->boolean('archived');

        $expenses = Expense::query()
            ->with(['fundPool:id,title_mm,title_en', 'reviewer:id,name'])
            ->when(! $showArchived, fn ($query) => $query->active())
            ->when($request->filled('fund_pool_id'), fn ($query) => $query->where('fund_pool_id', $request->integer('fund_pool_id')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Expenses', [
            'expenses' => $expenses,
            'fundPools' => FundPool::query()->orderBy('title_en')->get(['id', 'title_mm', 'title_en']),
            'reviewers' => User::query()->where('role', 'admin')->orderBy('name')->get(['id', 'name']),
            'categories' => Expense::CATEGORIES,
            'filters' => [
                'fund_pool_id' => $request->input('fund_pool_id', ''),
                'archived' => $showArchived,
            ],
            'comparison' => $this->comparison(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $receipt = $request->file('receipt');

        $expense = Expense::query()->create([
            ...$data,
            'receipt_path' => $receipt ? $receipt->store('expense-receipts', 'local') : null,
        ]);

        $this->audit('expense.created', $expense, [
            'category' => $expense->category,
            'amount' => (string) $expense->amount,
            'fund_pool_id' => $expense->fund_pool_id,
        ]);

        return redirect()->back()->with('success', 'Expense recorded successfully.');
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        $data = $this->validated($request);
        $receipt = $request->file('receipt');
        $previousReceipt = $expense->receipt_path;

        if ($receipt) {
            $data['receipt_path'] = $receipt->store('expense-receipts', 'local');
        }

        $expense->update($data);

        if ($receipt && $previousReceipt) {
            Storage::disk('local')->delete($previousReceipt);
        }

        $this->audit('expense.updated', $expense, [
            'category' => $expense->category,
            'amount' => (string) $expense->amount,
            'fund_pool_id' => $expense->fund_pool_id,
        ]);

        return redirect()->back()->with('success', 'Expense updated successfully.');
    }

    public function archive(Expense $expense): RedirectResponse
    {
        $expense->update([
            'archived_at' => $expense->archived_at ? null : now(),
        ]);

        $this->audit($expense->archived_at ? 'expense.archived' : 'expense.restored', $expense, [
            'amount' => (string) $expense->amount,
            'fund_pool_id' => $expense->fund_pool_id,
        ]);

        return redirect()->back()->with('success', $expense->archived_at ? 'Expense archived.' : 'Expense restored.');
    }

    public function downloadReceipt(Expense $expense): StreamedResponse
    {
        abort_unless($expense->receipt_path && Storage::disk('local')->exists($expense->receipt_path), 404);

        return Storage::disk('local')->download($expense->receipt_path);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'fund_pool_id' => ['required', 'integer', 'exists:fund_pools,id'],
            'category' => ['required', Rule::in(Expense::CATEGORIES)],
            'amount' => ['required', 'numeric', 'min:1'],
            'period_start' => ['nullable', 'date'],
            'period_end' => ['nullable', 'date', 'after_or_equal:period_start'],
            'reviewer_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', 'admin')],
            'note' => ['nullable', 'string', 'max:2000'],
            'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:4096'],
        ]);

        unset($data['receipt']);

        return $data;
    }

    /**
     * @return array{income: float, expenses: float, balance: float, by_pool: array<int, array{id: int, title: string, income: float, expenses: float, balance: float}>}
     */
    private function comparison(): array
    {
        $income = (float) Donation::query()->where('status', 'approved')->sum('amount');
        $expenses = (float) Expense::query()->active()->sum('amount');

        $byPool = FundPool::query()
            ->withSum(['donations as income' => fn ($query) => $query->where('status', 'approved')], 'amount')
            ->withSum(['expenses as spent' => fn ($query) => $query->active()], 'amount')
            ->orderBy('title_en')
            ->get()
            ->map(fn (FundPool $pool): array => [
                'id' => $pool->id,
                'title' => $pool->title_mm ?: $pool->title_en,
                'income' => (float) $pool->income,
                'expenses' => (float) $pool->spent,
                'balance' => (float) $pool->income - (float) $pool->spent,
            ])
            ->all();

        return [
            'income' => $income,
            'expenses' => $expenses,
            'balance' => $income - $expenses,
            'by_pool' => $byPool,
        ];
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private function audit(string $action, Expense $expense, array $metadata): void
    {
        AuditLog::query()->create([
            'actor_id' => auth()->id(),
            'action' => $action,
            'auditable_type' => Expense::class,
            'auditable_id' => $expense->id,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
        ]);
    }
}
