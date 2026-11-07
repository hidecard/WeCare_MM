<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * @implements CastsAttributes<array<int, string>, array<int, string>|null>
 */
class PublicPhotoPaths implements CastsAttributes
{
    /**
     * @return array<int, string>
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): array
    {
        $paths = is_string($value) ? json_decode($value, true) : $value;

        if (! is_array($paths)) {
            return [];
        }

        return array_values(array_filter(
            $paths,
            fn (mixed $path): bool => is_string($path)
                && $path !== ''
                && ! str_contains($path, '..')
                && Storage::disk('public')->exists($path)
        ));
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): string
    {
        $paths = is_array($value) ? array_values($value) : [];

        return json_encode($paths) ?: '[]';
    }
}
