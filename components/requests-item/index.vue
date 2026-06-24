<template>
  <div class="share-request-item">
    <div class="share-request-info">
      <div class="share-request-details">
        <p class="share-request-title">{{ counterpartLabel }}</p>
        <p class="share-request-meta">
          {{ entityCount }} {{ entityTypeLabel }} •
          {{ formatDate(request.created_at) }}
        </p>
      </div>
    </div>
    <div class="share-request-actions"><slot name="actions" /></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { ShareRequestInterface } from 'nucleify'

const props = defineProps<{
  request: ShareRequestInterface
  isReceived?: boolean
}>()

const counterpart = computed(() =>
  props.isReceived ? props.request.sender : props.request.receiver
)

const counterpartLabel = computed(() => {
  const p = counterpart.value
  const name = p?.name?.trim()
  if (name) return name
  const email = p?.email?.trim()
  if (email) return email
  return 'Unknown user'
})

const entityCount = computed(() => {
  const ids = props.request.entity_ids
  return Array.isArray(ids) ? ids.length : 0
})

const entityTypeLabel = computed(() => {
  const t = String(props.request.entity_type ?? 'item').trim() || 'item'
  const n = entityCount.value
  return n === 1 ? t : `${t}(s)`
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style lang="scss">
@import 'index';
</style>
