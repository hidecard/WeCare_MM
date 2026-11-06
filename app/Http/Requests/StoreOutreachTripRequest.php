<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOutreachTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'trip_date' => ['required', 'date'],
            'township' => ['required', 'string', 'max:255'],
            'elderly_helped_count' => ['required', 'integer', 'min:0'],
            'meals_distributed' => ['required', 'integer', 'min:0'],
            'medical_aid_count' => ['required', 'integer', 'min:0'],
            'total_spent' => ['required', 'numeric', 'min:0'],
            'summary_note' => ['nullable', 'string', 'max:2000'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'receipt_images' => ['nullable', 'array'],
            'receipt_images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }
}
