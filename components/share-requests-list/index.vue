<template>
  <div class="share-requests-list">
    <div v-if="requests.length === 0" class="share-requests-list-empty">
      <p>No share requests</p>
    </div>

    <nuc-share-requests-item
      v-for="request in requests"
      :key="request.id"
      :request="request"
      :is-received="isReceived"
    >
      <template #actions>
        <template v-if="isReceived">
          <ad-button
            ad-type="main"
            icon="prime:check"
            text
            rounded
            @click="$emit('accept', request.id)"
          />
          <ad-button
            icon="prime:times"
            text
            rounded
            severity="danger"
            @click="$emit('reject', request.id)"
          />
        </template>
        <template v-else>
          <ad-button
            v-if="request.status === 'pending'"
            ad-type="main"
            icon="prime:times"
            text
            rounded
            severity="secondary"
            @click="$emit('cancel', request.id)"
          />
          <ad-tag
            v-else
            :value="request.status"
            :severity="request.status === 'accepted' ? 'success' : 'danger'"
          />
        </template>
      </template>
    </nuc-share-requests-item>
  </div>
</template>

<script setup lang="ts">
import type { ShareRequestInterface } from 'atomic'

interface Props {
  requests?: ShareRequestInterface[]
  isReceived?: boolean
}

withDefaults(defineProps<Props>(), {
  requests: () => [],
  isReceived: false,
})

defineEmits<{
  accept: [id: number]
  reject: [id: number]
  cancel: [id: number]
}>()
</script>

<style lang="scss">
@import 'index';
</style>
