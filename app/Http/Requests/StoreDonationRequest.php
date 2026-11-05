<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fund_pool_id' => ['required', 'integer', 'exists:fund_pools,id'],
            'amount' => ['required', 'numeric', 'min:1000'],
            'payment_method' => [
                'required',
                Rule::exists('payment_methods', 'name')->where(fn ($query) => $query->where('is_active', true)),
            ],
            'donor_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'is_anonymous' => ['nullable', 'boolean'],
            'wish_note' => ['nullable', 'string', 'max:1000'],
            'slip_image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }
}
