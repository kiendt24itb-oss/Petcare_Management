<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class RoomTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'roomTypeId'   => $this->room_type_id,
            'typeCode'     => $this->type_code,
            'categoryId'   => $this->category_id,
            'categoryName' => $this->category ? $this->category->category_name : null,
            'typeName'     => $this->type_name,
            'description'  => $this->description,
            'createdAt'    => $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null,
        ];
    }
}