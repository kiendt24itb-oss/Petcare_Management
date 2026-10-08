<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $table = 'services';
    protected $primaryKey = 'service_id';

    public $timestamps = true;
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'category_id',
        'service_code',
        'required_room_type_id',
        'service_name',
        'description',
        'duration',
        'price',
        'image_url',
        'status',
        'created_at',
        'updated_at',
    ];

    /**
     * Dịch vụ thuộc về 1 ServiceCategory (Nhóm dịch vụ: HEALTH, SPA, HOTEL)
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id', 'category_id');
    }

    /**
     * Dịch vụ yêu cầu 1 loại phòng nhất định (RoomType)
     */
    public function requiredRoomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class, 'required_room_type_id', 'room_type_id');
    }

    /**
     * Quan hệ với các BookingDetail sử dụng dịch vụ này
     */
    public function bookingDetails(): HasMany
    {
        return $this->hasMany(BookingDetail::class, 'service_id', 'service_id');
    }
}