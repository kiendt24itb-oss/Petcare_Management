<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceCategory extends Model
{
    use HasFactory;

    protected $table = 'service_categories';
    protected $primaryKey = 'category_id';
    public $timestamps = false; // Bảng chỉ có created_at, không có updated_at

    protected $fillable = [
        'category_code',
        'category_name',
        'description',
        'created_at',
    ];

    /**
     * Mối quan hệ 1-N với RoomType
     */
    public function roomTypes(): HasMany
    {
        return $this->hasMany(RoomType::class, 'category_id', 'category_id');
    }

    /**
     * Mối quan hệ 1-N với Service
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'category_id', 'category_id');
    }
}