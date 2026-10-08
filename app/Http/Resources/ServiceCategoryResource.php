<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class ServiceCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'categoryId'   => $this->category_id,
            'categoryCode' => $this->category_code,
            'categoryName' => $this->category_name,
            'description'  => $this->description,
            'createdAt'    => $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null,
        ];
    }
}