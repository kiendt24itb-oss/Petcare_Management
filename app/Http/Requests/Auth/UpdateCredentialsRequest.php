<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCredentialsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('api')->check();
    }

    public function rules(): array
    {
        $accountId = auth('api')->id();

        return [
            'username'         => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('accounts', 'username')->ignore($accountId, 'account_id')
            ],
            'current_password' => 'required_with:new_password|string',
            'new_password'     => 'nullable|string|min:6|confirmed', // Cần gửi thêm field 'new_password_confirmation'
        ];
    }

    public function messages(): array
    {
        return [
            'username.unique'            => 'Tên đăng nhập này đã được sử dụng!',
            'current_password.required_with' => 'Vui lòng nhập mật khẩu hiện tại để xác thực!',
            'new_password.min'           => 'Mật khẩu mới phải có ít nhất 6 ký tự!',
            'new_password.confirmed'     => 'Xác nhận mật khẩu mới không khớp!',
        ];
    }
}