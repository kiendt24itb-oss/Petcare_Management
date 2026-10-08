<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomType extends Model
{
    use HasFactory;

    protected $table = 'room_types';
    protected $primaryKey = 'room_type_id';
    public $timestamps = false; // Bảng chỉ có created_at, không có updated_at

    protected $fillable = [
        'type_code',
        'category_id',
        'type_name',
        'description',
        'created_at',
    ];

    /**
     * Thuộc về 1 ServiceCategory (Tầng 1)
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id', 'category_id');
    }

    /**
     * Mối quan hệ 1-N với Room (Tầng 3)
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'room_type_id', 'room_type_id');
    }

    /**
     * Mối quan hệ 1-N với các Services yêu cầu loại phòng này
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'required_room_type_id', 'room_type_id');
    }
}