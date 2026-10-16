<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Validator;
use JsonException;

class ImportProjectRequest extends StoreProjectRequest
{
    private bool $hasInvalidJson = false;

    protected function prepareForValidation(): void
    {
        $file = $this->file('file');

        if (! $file) {
            return;
        }

        try {
            $decoded = json_decode($file->get(), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            $this->hasInvalidJson = true;

            return;
        }

        if (! is_array($decoded) || array_is_list($decoded)) {
            $this->hasInvalidJson = true;

            return;
        }

        $this->merge(['data' => $decoded['data'] ?? $decoded]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:10240'],
            ...$this->projectRules(false),
        ];
    }

    protected function withValidator($validator): void
    {
        parent::withValidator($validator);

        $validator->after(function (Validator $validator): void {
            if ($this->hasInvalidJson) {
                $validator->errors()->add('file', 'The file must contain a valid WebMuzic project JSON.');
            }
        });
    }
}
