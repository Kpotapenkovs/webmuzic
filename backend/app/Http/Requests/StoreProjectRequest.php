<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->projectRules();
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function projectRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'data' => ['required', 'array'],
            'data.bpm' => ['required', 'integer', 'between:1,1000'],
            'data.patterns' => ['required', 'array', 'min:1'],
            'data.patterns.*.id' => ['required', 'string', 'max:255'],
            'data.patterns.*.name' => ['required', 'string', 'max:255'],
            'data.patterns.*.notes' => ['present', 'array'],
            'data.selectedPatternId' => ['required', 'string', 'max:255'],
            'data.arrangement' => ['present', 'array'],
        ];
    }
}
