<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Customer extends Model
{
    protected $table = 'customers';
    protected $primaryKey = 'customer_id';
    public $timestamps = false;

    protected $fillable = [
        'customer_code',
        'account_id',
        'full_name',
        'age',
        'gender',
        'email',
        'phone',
        'address',
        'avatar',
        'violation_count',
    ];

    protected $casts = [
        'age' => 'integer',
        'violation_count' => 'integer',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }

    public function pets(): HasMany
    {
        return $this->hasMany(Pet::class, 'customer_id', 'customer_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'customer_id', 'customer_id');
    }
}