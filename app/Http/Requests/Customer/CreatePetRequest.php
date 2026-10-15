<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CreatePetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'petName'    => 'required|string|max:250',
            'species'    => 'nullable|string|max:100',
            'breed'      => 'nullable|string|max:100',
            'age'        => 'nullable|integer|min:0',
            'weight'     => 'nullable|numeric|min:0',
            'gender'     => 'nullable|in:MALE,FEMALE',
            'avatar'     => 'nullable|string|max:500',
            'healthNote' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'petName.required' => 'Tên thú cưng không được để trống!',
            'gender.in'        => 'Giới tính thú cưng không hợp lệ!',
            'weight.numeric'   => 'Cân nặng phải là một số!',
        ];
    }
}