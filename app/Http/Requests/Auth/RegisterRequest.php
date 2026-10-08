<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username'  => 'required|string|max:100|unique:accounts,username',
            'email'     => 'required|email|max:255|unique:accounts,email',
            'password'  => 'required|string|min:6',
            'full_name' => 'required|string|max:250',
            'phone'     => 'nullable|string|max:15',
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'Vui lòng nhập tên đăng nhập!',
            'username.unique'   => 'Tên đăng nhập đã tồn tại trên hệ thống!',
            'email.required'    => 'Vui lòng nhập email!',
            'email.email'       => 'Email không đúng định dạng!',
            'email.unique'      => 'Email đã tồn tại trên hệ thống!',
            'password.required' => 'Vui lòng nhập mật khẩu!',
            'password.min'      => 'Mật khẩu phải có ít nhất 6 ký tự!',
            'full_name.required' => 'Vui lòng nhập họ và tên!',
        ];
    }
}