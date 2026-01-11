<?php

namespace App\Http\Controllers;

use App\Services\ShareService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    private ShareService $service;

    public function __construct(ShareService $service)
    {
        $this->service = $service;
    }

    /**
     * Share entities with users
     *
     * @param Request $request
     *
     * @return JsonResponse
     *
     * @throws Exception
     */
    public function share(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'entity_ids' => 'required|array',
                'entity_ids.*' => 'required|integer',
                'entity_type' => 'required|string',
                'user_ids' => 'required|array',
                'user_ids.*' => 'required|integer|exists:users,id',
            ]);

            $result = $this->service->shareEntities(
                $validated['entity_ids'],
                $validated['entity_type'],
                $validated['user_ids']
            );

            return response()->json($result);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
