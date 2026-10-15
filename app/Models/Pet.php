<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pet extends Model
{
    use HasFactory;

    protected $table = 'pets';
    protected $primaryKey = 'pet_id';

    public $timestamps = false; // DB chỉ có created_at DEFAULT CURRENT_TIMESTAMP

    protected $fillable = [
        'pet_code',
        'customer_id',
        'pet_name',
        'species',
        'breed',
        'age',
        'weight',
        'gender',
        'avatar',
        'health_note',
        'created_at',
    ];

    /**
     * Mối quan hệ N-1: Pet thuộc về 1 Customer (chủ sở hữu)
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customer_id');
    }

    /**
     * Mối quan hệ 1-N: Chi tiết booking liên quan tới thú cưng này
     */
    public function bookingDetails(): HasMany
    {
        return $this->hasMany(BookingDetail::class, 'pet_id', 'pet_id');
    }
}