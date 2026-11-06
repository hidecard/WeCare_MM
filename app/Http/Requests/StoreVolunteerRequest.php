<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVolunteerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'township' => ['required', 'string', 'max:255'],
            'available_days' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:255'],
        ];
    }
}
