<?php

namespace App\Services;

use App\Repositories\Contracts\PositionRepositoryInterface;
use App\Services\CodeGeneratorService;
use Exception;
use Illuminate\Support\Facades\DB;

class PositionService
{
    protected PositionRepositoryInterface $positionRepo;

    public function __construct(PositionRepositoryInterface $positionRepo)
    {
        $this->positionRepo = $positionRepo;
    }

    public function getAllPositions()
    {
        return $this->positionRepo->getAll();
    }

    public function getPositionById(int $id)
    {
        $position = $this->positionRepo->findById($id);
        if (!$position) {
            throw new Exception('Không tìm thấy chức vụ!');
        }
        return $position;
    }

    public function createPosition(array $data)
    {
        return DB::transaction(function () use ($data) {
            $payload = [
                'position_code' => CodeGeneratorService::generate('positions', 'position_code', 'position'),
                'position_name' => $data['positionName'],
                'description'   => $data['description'] ?? null,
                'allowance'     => $data['allowance'] ?? 0.00,
            ];

            return $this->positionRepo->create($payload);
        });
    }

    public function updatePosition(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $position = $this->positionRepo->findById($id);
            if (!$position) {
                throw new Exception('Chức vụ không tồn tại!');
            }

            $updateData = [
                'position_name' => $data['positionName'] ?? $position->position_name,
                'description'   => $data['description'] ?? $position->description,
                'allowance'     => $data['allowance'] ?? $position->allowance,
            ];

            return $this->positionRepo->update($id, $updateData);
        });
    }

    public function deletePosition(int $id)
    {
        return DB::transaction(function () use ($id) {
            $position = $this->positionRepo->findById($id);
            if (!$position) {
                throw new Exception('Không tìm thấy chức vụ cần xóa!');
            }

            return $this->positionRepo->delete($id);
        });
    }
}