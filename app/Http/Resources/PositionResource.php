<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class PositionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'positionId'   => $this->position_id,
            'positionCode' => $this->position_code,
            'positionName' => $this->position_name,
            'description'  => $this->description,
            'allowance'    => (float) $this->allowance,
            'createdAt'    => $this->created_at ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null,
            'updatedAt'    => $this->updated_at ? Carbon::parse($this->updated_at)->format('Y-m-d H:i:s') : null,
        ];
    }
}