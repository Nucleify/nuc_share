<?php

namespace App\Services;

use Exception;

class ShareService
{
    public function __construct(
        private readonly LoggerService $logger = new LoggerService
    ) {}

    /**
     * Share entities with users - copy entities to user's database
     *
     * @param array $entityIds
     * @param string $entityType
     * @param array $userIds
     *
     * @return array
     */
    public function shareEntities(array $entityIds, string $entityType, array $userIds): array
    {
        $modelClass = $this->getEntityClass($entityType);
        $copiedCount = 0;

        foreach ($entityIds as $entityId) {
            $originalEntity = $modelClass::find($entityId);

            if (!$originalEntity) {
                continue;
            }

            foreach ($userIds as $targetUserId) {
                $this->copyEntityToUser($originalEntity, $targetUserId);
                $copiedCount++;
            }
        }

        $this->logger->log(
            auth()->user()->name,
            "{$copiedCount} entities",
            $entityType,
            'shared'
        );

        return [
            'message' => "Successfully shared {$copiedCount} entities",
            'copied_count' => $copiedCount,
        ];
    }

    /**
     * Copy entity to user's database
     *
     * @param mixed $originalEntity
     * @param int $targetUserId
     *
     * @return mixed
     */
    private function copyEntityToUser($originalEntity, int $targetUserId)
    {
        $attributes = $originalEntity->getAttributes();
        unset($attributes['id']);
        unset($attributes['created_at']);
        unset($attributes['updated_at']);

        $attributes['user_id'] = $targetUserId;

        $modelClass = get_class($originalEntity);

        return $modelClass::create($attributes);
    }

    /**
     * Get entity class name from entity type
     *
     * @param string $entityType
     *
     * @return string
     */
    private function getEntityClass(string $entityType): string
    {
        $entityMap = [
            'article' => \App\Models\Article::class,
            'contact' => \App\Models\Contact::class,
            'money' => \App\Models\Money::class,
            'card' => \App\Models\Card::class,
            'task' => \App\Models\Task::class,
            'file' => \App\Models\File::class,
            'documentation' => \App\Models\Documentation::class,
            'question' => \App\Models\Question::class,
            'technology' => \App\Models\Technology::class,
            'link' => \App\Models\Link::class,
            'feature' => \App\Models\Feature::class,
        ];

        return $entityMap[$entityType] ?? throw new Exception("Unknown entity type: {$entityType}");
    }
}
