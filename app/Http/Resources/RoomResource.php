<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class RoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'roomId'       => $this->room_id,
            'roomCode'     => $this->room_code,
            'roomName'     => $this->room_name,
            'roomTypeId'   => $this->room_type_id,
            'typeName'     => $this->roomType ? $this->roomType->type_name : null,
            'categoryId'   => $this->roomType ? $this->roomType->category_id : null,
            'categoryName' => ($this->roomType && $this->roomType->category) ? $this->roomType->category->category_name : null,
            'capacity'     => $this->capacity,
            'status'       => $this->status,
            'note'         => $this->note,
            'createdAt'    => $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null,
            'updatedAt'    => $this->updated_at ? Carbon::parse($this->updated_at)->format('Y-m-d H:i:s') : null,
        ];
    }
}