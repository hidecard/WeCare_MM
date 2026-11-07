<?php

namespace App\Http\Requests;

use App\Rules\MyanmarMobileNumber;
use Illuminate\Foundation\Http\FormRequest;

class StoreSpotReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'reporter_phone' => MyanmarMobileNumber::normalize($this->input('reporter_phone')),
        ]);
    }

    public function rules(): array
    {
        return [
            'township' => ['required', 'string', 'max:255'],
            'street_landmark' => ['required', 'string', 'max:255'],
            'time_seen' => ['nullable', 'date'],
            'condition_note' => ['nullable', 'string', 'max:2000'],
            'reporter_phone' => ['nullable', 'string', 'max:20', new MyanmarMobileNumber],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }
}
