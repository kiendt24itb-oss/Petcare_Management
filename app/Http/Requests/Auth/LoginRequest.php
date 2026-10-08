<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => 'required|string', // Hoặc có thể gửi login (username/email)
            'password' => 'required|string|min:6',
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'Vui lòng nhập tên đăng nhập hoặc email!',
            'password.required' => 'Vui lòng nhập mật khẩu!',
            'password.min'      => 'Mật khẩu phải có ít nhất 6 ký tự!',
        ];
    }
}