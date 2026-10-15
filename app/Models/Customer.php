<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $table = 'customers';
    protected $primaryKey = 'customer_id';

    public $timestamps = false; // DB chỉ có created_at DEFAULT CURRENT_TIMESTAMP

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
        'created_at',
    ];

    /**
     * Mối quan hệ N-1: Customer thuộc về 1 Account
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }

    /**
     * Mối quan hệ 1-N: 1 Customer có nhiều Thú cưng (Pets)
     */
    public function pets(): HasMany
    {
        return $this->hasMany(Pet::class, 'customer_id', 'customer_id');
    }

    /**
     * Mối quan hệ 1-N: Các đơn đặt lịch của khách hàng
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'customer_id', 'customer_id');
    }

    /**
     * Mối quan hệ 1-N: Các hóa đơn của khách hàng
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'customer_id', 'customer_id');
    }
}