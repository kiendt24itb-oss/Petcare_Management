<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fullName' => 'required|string|max:250',
            'age'      => 'nullable|integer|min:1|max:120',
            'gender'   => 'nullable|in:MALE,FEMALE,OTHER',
            'email'    => 'nullable|email|max:250',
            'phone'    => 'nullable|string|max:15',
            'address'  => 'nullable|string|max:500',
            'avatar'   => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'fullName.required' => 'Họ và tên không được để trống!',
            'gender.in'         => 'Giới tính không hợp lệ!',
            'email.email'       => 'Định dạng email không hợp lệ!',
        ];
    }
}