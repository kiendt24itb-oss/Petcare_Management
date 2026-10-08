<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ChangeRoomStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'roomId' => 'required|integer|exists:rooms,room_id',
            'status' => 'required|string|in:AVAILABLE,OCCUPIED,MAINTENANCE,ASSIGNED',
        ];
    }

    public function messages(): array
    {
        return [
            'roomId.required' => 'ID phòng không được để trống!',
            'status.required' => 'Trạng thái phòng không được để trống!',
            'status.in'       => 'Trạng thái không hợp lệ!',
        ];
    }
}