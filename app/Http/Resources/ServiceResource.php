<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'serviceId'            => $this->service_id,
            'serviceCode'          => $this->service_code,
            'serviceName'          => $this->service_name,
            'categoryId'           => $this->category_id,
            'categoryName'         => $this->category ? $this->category->category_name : null,
            'categoryCode'         => $this->category ? $this->category->category_code : null,
            'requiredRoomTypeId'   => $this->required_room_type_id,
            'requiredRoomTypeName' => $this->requiredRoomType ? $this->requiredRoomType->type_name : null,
            'duration'             => $this->duration,
            'price'                => (float) $this->price,
            'imageUrl'             => $this->image_url,
            'description'          => $this->description,
            'status'               => $this->status,
            'createdAt'            => $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null,
            'updatedAt'            => $this->updated_at ? Carbon::parse($this->updated_at)->format('Y-m-d H:i:s') : null,
        ];
    }
}