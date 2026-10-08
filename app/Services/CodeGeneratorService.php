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
    'staff'    => 'NV',
    'product'  => 'SP',
    'invoice'  => 'INV',
    'service'  => 'SV',
    'pet'      => 'PET', // BỔ SUNG
    'position' => 'POS', // BỔ SUNG
    ];

    /**
     * Tự động quét DB tìm mã lớn nhất và sinh mã mới
     *
     * @param string $tableName Tên bảng (VD: 'bookings')
     * @param string $columnName Tên cột chứa mã (VD: 'booking_code')
     * @param string $moduleKey Loaị module lấy prefix (VD: 'booking')
     * @return string (VD: 'BK-A001')
     */
    public static function generate(string $tableName, string $columnName, string $moduleKey): string
    {
        $moduleKey = strtolower($moduleKey);
        
        // 1. Lấy Prefix từ bảng định nghĩa (Nếu chưa khai báo thì tự lấy chữ cái in hoa của moduleKey)
        $prefix = self::PREFIXES[$moduleKey] ?? strtoupper($moduleKey);

        // 2. Truy vấn DB lấy mã lớn nhất hiện tại theo Prefix tương ứng
        $maxCode = DB::table($tableName)
            ->where($columnName, 'LIKE', "{$prefix}-%")
            ->orderBy($columnName, 'desc')
            ->value($columnName);

        // 3. Nếu chưa có bản ghi nào trong DB, mặc định bắt đầu từ A001
        if (empty($maxCode)) {
            return "{$prefix}-A001";
        }

        // 4. Bóc tách phần hậu tố sau dấu gạch ngang (VD: "BK-A099" -> lấy "A099")
        $parts = explode('-', $maxCode);
        $suffix = end($parts);

        // Lấy ký tự chữ cái (A-Z) và phần số (001-099)
        $letter = substr($suffix, 0, 1);
        $number = (int) substr($suffix, 1);

        // Tăng số thêm 1
        $number++;

        // Nếu vượt quá 99, reset về 1 và nhảy sang chữ cái tiếp theo (A -> B -> C...)
        if ($number > 99) {
            $number = 1;
            $letter++; // Trong PHP: 'A'++ ra 'B', 'Z'++ ra 'AA'
        }

        // Định dạng số luôn đủ 3 chữ số (VD: 1 -> 001)
        $formattedNumber = str_pad($number, 3, '0', STR_PAD_LEFT);

        return "{$prefix}-{$letter}{$formattedNumber}";
    }
}