<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TransferRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sourceRoomId' => 'required|integer|exists:rooms,room_id',
            'targetRoomId' => 'required|integer|exists:rooms,room_id|different:sourceRoomId',
            'reason'       => 'required|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'sourceRoomId.required' => 'Vui lòng chọn phòng bị sự cố!',
            'targetRoomId.required' => 'Vui lòng chọn phòng thay thế!',
            'targetRoomId.different' => 'Phòng thay thế phải khác phòng nguồn!',
            'reason.required'       => 'Vui lòng nhập lý do điều chuyển!',
        ];
    }
}