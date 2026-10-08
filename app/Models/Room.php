<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $table = 'rooms';
    protected $primaryKey = 'room_id';

    public $timestamps = true;
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'room_code',
        'room_name',
        'room_type_id',
        'capacity',
        'status',
        'note',
        'created_at',
        'updated_at',
    ];

    /**
     * Thuộc về 1 RoomType
     */
    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class, 'room_type_id', 'room_type_id');
    }

    /**
     * Quan hệ với các BookingDetail thực hiện tại phòng này
     */
    public function bookingDetails(): HasMany
    {
        return $this->hasMany(BookingDetail::class, 'room_id', 'room_id');
    }
}