<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'petId'      => 'required|integer|exists:pets,pet_id',
            'petName'    => 'sometimes|required|string|max:250',
            'species'    => 'nullable|string|max:100',
            'breed'      => 'nullable|string|max:100',
            'age'        => 'nullable|integer|min:0',
            'weight'     => 'nullable|numeric|min:0',
            'gender'     => 'nullable|string|in:MALE,FEMALE',
            'avatar'     => 'nullable|string|max:500',
            'healthNote' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'petId.required'   => 'ID thú cưng không được để trống!',
            'petId.exists'     => 'Thú cưng không tồn tại!',
            'petName.required' => 'Tên thú cưng không được để trống!',
        ];
    }
}