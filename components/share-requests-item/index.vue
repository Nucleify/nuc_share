<template>
  <div class="share-request-item">
    <div class="share-request-info">
      <div class="share-request-details">
        <p>{{ isReceived ? request.sender?.name : request.receiver?.name }}</p>
        <p class="share-request-meta">
          {{ request.entity_ids.length }} {{ request.entity_type }}(s) • {{ formatDate(request.created_at) }}
        </p>
      </div>
    </div>
    <div class="share-request-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShareRequestInterface } from 'atomic'

defineProps<{
  request: ShareRequestInterface
  isReceived?: boolean
}>()

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style lang="scss">
@import 'index';
</style>
