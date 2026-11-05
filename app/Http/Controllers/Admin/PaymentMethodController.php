<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/PaymentMethods', [
            'paymentMethods' => PaymentMethod::query()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn (PaymentMethod $method): array => [
                    ...$method->toArray(),
                    'qr_url' => $method->qr_image_path ? Storage::disk('public')->url($method->qr_image_path) : null,
                ]),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['qr_image_path'] = $this->storeQr($request, null);
        PaymentMethod::query()->create($data);

        return redirect()->back()->with('success', 'Payment method created successfully.');
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $data = $this->validated($request, $paymentMethod);

        if ($request->hasFile('qr_image')) {
            if ($paymentMethod->qr_image_path) {
                Storage::disk('public')->delete($paymentMethod->qr_image_path);
            }
            $data['qr_image_path'] = $this->storeQr($request, $paymentMethod);
        }

        $paymentMethod->update($data);

        return redirect()->back()->with('success', 'Payment method updated successfully.');
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        if ($paymentMethod->qr_image_path) {
            Storage::disk('public')->delete($paymentMethod->qr_image_path);
        }
        $paymentMethod->delete();

        return redirect()->back()->with('success', 'Payment method deleted successfully.');
    }

    private function validated(Request $request, ?PaymentMethod $paymentMethod = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:payment_methods,name'.($paymentMethod ? ','.$paymentMethod->id : '')],
            'account_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['required', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'qr_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);
    }

    private function storeQr(Request $request, ?PaymentMethod $paymentMethod): ?string
    {
        return $request->file('qr_image')?->store('payment-qr', 'public');
    }
}
