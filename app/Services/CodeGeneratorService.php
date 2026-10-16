<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class CodeGeneratorService
{
    /**
     * Bảng định nghĩa Tiền tố (Prefix) cố định cho từng Module
     */
    public const PREFIXES = [
        'health'   => 'HE',
        'hotel'    => 'HT',
        'room'     => 'RM',
        'customer' => 'KH',
        'booking'  => 'BK',
        'staff'    => 'NV', // Mặc định nếu không truyền mã chức vụ
        'product'  => 'SP',
        'invoice'  => 'INV',
        'service'  => 'SV',
        'pet'      => 'PET',
        'position' => 'POS',
    ];

    /**
     * Tự động quét DB tìm mã lớn nhất và sinh mã mới
     */
    public static function generate(string $tableName, string $columnName, string $moduleKey): string
    {
        $moduleKey = strtolower($moduleKey);
        $prefix = self::PREFIXES[$moduleKey] ?? strtoupper($moduleKey);

        return self::generateWithCustomPrefix($tableName, $columnName, $prefix);
    }

    /**
     * Sinh mã theo tiền tố tùy chỉnh truyền vào (VD: "BS" -> "BS-A001")
     */
    public static function generateWithCustomPrefix(string $tableName, string $columnName, string $prefix): string
    {
        $prefix = strtoupper($prefix);

        // Truy vấn DB lấy mã lớn nhất hiện tại theo Prefix
        $maxCode = DB::table($tableName)
            ->where($columnName, 'LIKE', "{$prefix}-%")
            ->orderBy($columnName, 'desc')
            ->value($columnName);

        if (empty($maxCode)) {
            return "{$prefix}-A001";
        }

        $parts = explode('-', $maxCode);
        $suffix = end($parts);

        $letter = substr($suffix, 0, 1);
        $number = (int) substr($suffix, 1);

        $number++;

        if ($number > 99) {
            $number = 1;
            $letter++;
        }

        $formattedNumber = str_pad($number, 3, '0', STR_PAD_LEFT);

        return "{$prefix}-{$letter}{$formattedNumber}";
    }
}