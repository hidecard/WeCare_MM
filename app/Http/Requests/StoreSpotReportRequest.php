<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSpotReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'township' => ['required', 'string', 'max:255'],
            'street_landmark' => ['required', 'string', 'max:255'],
            'time_seen' => ['required', 'date'],
            'condition_note' => ['required', 'string', 'max:2000'],
            'reporter_phone' => ['nullable', 'string', 'max:255'],
        ];
    }
}
