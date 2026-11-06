<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
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
        $qrImage = $data['qr_image'] ?? null;
        unset($data['qr_image'], $data['remove_qr_image']);

        $data['qr_image_path'] = $qrImage?->store('payment-qr', 'public');
        PaymentMethod::query()->create($data);

        return redirect()->back()->with('success', 'Payment method created successfully.');
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $data = $this->validated($request, $paymentMethod);
        $qrImage = $data['qr_image'] ?? null;
        $removeQrImage = (bool) ($data['remove_qr_image'] ?? false);
        unset($data['qr_image'], $data['remove_qr_image']);

        $previousQrPath = $paymentMethod->qr_image_path;
        $newQrPath = $qrImage?->store('payment-qr', 'public');

        if ($newQrPath) {
            $data['qr_image_path'] = $newQrPath;
        } elseif ($removeQrImage) {
            $data['qr_image_path'] = null;
        }

        $paymentMethod->update($data);

        if ($previousQrPath && ($newQrPath || $removeQrImage)) {
            Storage::disk('public')->delete($previousQrPath);
        }

        return redirect()->back()->with('success', 'Payment method updated successfully.');
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        $qrImagePath = $paymentMethod->qr_image_path;
        $paymentMethod->delete();

        if ($qrImagePath) {
            Storage::disk('public')->delete($qrImagePath);
        }

        return redirect()->back()->with('success', 'Payment method deleted successfully.');
    }

    private function validated(Request $request, ?PaymentMethod $paymentMethod = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('payment_methods', 'name')->ignore($paymentMethod?->id),
            ],
            'account_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['required', 'string', 'max:100'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
            'qr_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'remove_qr_image' => ['sometimes', 'boolean'],
        ]);
    }
}
