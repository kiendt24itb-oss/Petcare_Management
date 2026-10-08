<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Exception;

trait UploadImageTrait
{
    /**
     * Hàm upload ảnh dùng chung cho các Controller
     * 
     * @param Request $request
     * @param string $inputName Tên field file (VD: 'image_file')
     * @param string $folderName Tên thư mục con trong public/uploads/ (VD: 'services', 'products')
     * @param int $maxKb Dung lượng tối đa tính bằng KB (Default: 10MB = 10240 KB)
     * @return string URL ảnh hoàn chỉnh
     */
    public function uploadImageFile(Request $request, string $inputName = 'image_file', string $folderName = 'general', int $maxKb = 10240): string
    {
        $request->validate([
            $inputName => "required|image|mimes:jpeg,png,jpg,gif,webp|max:{$maxKb}",
        ], [
            "{$inputName}.required" => 'Vui lòng chọn file hình ảnh!',
            "{$inputName}.image"    => 'File tải lên phải là hình ảnh!',
            "{$inputName}.mimes"    => 'Ảnh phải thuộc định dạng: jpeg, png, jpg, gif, webp!',
            "{$inputName}.max"      => 'Kích thước ảnh không được vượt quá ' . ($maxKb / 1024) . 'MB!',
        ]);

        if ($request->hasFile($inputName)) {
            $file = $request->file($inputName);
            
            // Đặt tên file độc nhất (VD: service_1728220800_652a1b2c3d.jpg)
            $filename = rtrim($folderName, 's') . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            $destinationPath = public_path("uploads/{$folderName}");
            
            if (!File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true, true);
            }

            $file->move($destinationPath, $filename);
            
            return asset("uploads/{$folderName}/" . $filename);
        }

        throw new Exception('Không tìm thấy file ảnh tải lên!');
    }
}