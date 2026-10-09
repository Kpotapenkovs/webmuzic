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

    protected function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $data = $this->input('data', []);
            $patterns = $data['patterns'] ?? [];
            $patternIds = collect($patterns)->pluck('id')->filter()->values()->all();

            if ($patternIds !== array_values(array_unique($patternIds))) {
                $validator->errors()->add('data.patterns', 'Pattern IDs must be unique.');
            }

            $selectedPatternId = $data['selectedPatternId'] ?? null;
            if (is_string($selectedPatternId) && $patternIds !== [] && ! in_array($selectedPatternId, $patternIds, true)) {
                $validator->errors()->add('data.selectedPatternId', 'The selected pattern must exist in the project patterns.');
            }

            foreach ($data['arrangement'] ?? [] as $index => $clip) {
                if (! is_array($clip)) {
                    continue;
                }

                $patternId = $clip['patternId'] ?? null;
                if (is_string($patternId) && $patternIds !== [] && ! in_array($patternId, $patternIds, true)) {
                    $validator->errors()->add("data.arrangement.$index.patternId", 'The clip must reference an existing pattern.');
                }
            }
        });
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function projectRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'data' => ['required', 'array'],
            'data.bpm' => ['required', 'integer', 'between:40,240'],
            'data.patterns' => ['required', 'array', 'min:1'],
            'data.patterns.*.id' => ['required', 'string', 'max:255'],
            'data.patterns.*.name' => ['required', 'string', 'max:255'],
            'data.patterns.*.notes' => ['present', 'array'],
            'data.patterns.*.notes.*.id' => ['required', 'string', 'max:255'],
            'data.patterns.*.notes.*.row' => ['required', 'integer', 'between:0,127'],
            'data.patterns.*.notes.*.beat' => ['required', 'numeric', 'min:0'],
            'data.patterns.*.notes.*.length' => ['required', 'numeric', 'min:0.5', 'max:1200', 'multiple_of:0.5'],
            'data.selectedPatternId' => ['required', 'string', 'max:255'],
            'data.arrangement' => ['present', 'array'],
            'data.arrangement.*.id' => ['required', 'string', 'max:255'],
            'data.arrangement.*.patternId' => ['required', 'string', 'max:255'],
            'data.arrangement.*.startBeat' => ['required', 'numeric', 'min:0'],
            'data.arrangement.*.track' => ['required', 'integer', 'min:0'],
        ];
    }
}
