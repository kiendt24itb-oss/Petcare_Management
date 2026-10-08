<?php

namespace App\Repositories\Eloquent;

use App\Models\Service;
use App\Repositories\Contracts\ServiceRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ServiceRepository implements ServiceRepositoryInterface
{
    public function getAll(): Collection
    {
        return Service::with(['category', 'requiredRoomType'])
            ->orderBy('service_id', 'desc')
            ->get();
    }

    public function findById(int $id): ?Service
    {
        return Service::with(['category', 'requiredRoomType'])->find($id);
    }

    public function create(array $data): Service
    {
        return Service::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $service = Service::find($id);
        if (!$service) {
            return false;
        }
        return $service->update($data);
    }

    public function delete(int $id): bool
    {
        $service = Service::find($id);
        if (!$service) {
            return false;
        }
        return $service->delete();
    }
}