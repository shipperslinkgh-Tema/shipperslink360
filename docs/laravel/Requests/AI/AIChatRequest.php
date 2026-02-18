<?php

namespace App\Http\Requests\AI;

use Illuminate\Foundation\Http\FormRequest;

class AIChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // staff only — enforced via auth:sanctum middleware
    }

    public function rules(): array
    {
        return [
            'prompt' => ['required', 'string', 'min:1', 'max:4000'],
            'module' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'prompt.required' => 'A prompt is required to use the AI assistant.',
            'prompt.max'      => 'Prompt must not exceed 4000 characters.',
        ];
    }
}
