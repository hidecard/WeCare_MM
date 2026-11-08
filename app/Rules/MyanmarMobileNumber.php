<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class MyanmarMobileNumber implements ValidationRule
{
    public static function normalize(mixed $value): ?string
    {
        $digits = preg_replace('/[\s\-()]/', '', (string) $value) ?? '';

        return $digits === '' ? null : $digits;
    }

    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $digits = self::normalize($value);

        if ($digits === null) {
            return;
        }

        if (! preg_match('/^09\d{7,9}$/', $digits)) {
            $fail('Enter a mobile number that starts with 09.');
        }
    }
}
