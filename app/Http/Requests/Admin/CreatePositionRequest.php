<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreatePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'positionName' => 'required|string|max:100',
            'description'  => 'nullable|string',
            'allowance'    => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'positionName.required' => 'Tên chức vụ không được để trống!',
            'allowance.min'          => 'Phụ cấp không được nhỏ hơn 0!',
        ];
    }
}