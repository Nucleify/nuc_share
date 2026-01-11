<template>
  <div class="share-popover-container">
    <ad-heading
      :tag="3"
      text="Share Requests"
      class="share-popover-header"
    />

    <div class="share-popover-content">
      <nuc-share-tabs
        :active-tab="activeTab"
        @update:active-tab="activeTab = $event"
      />

      <nuc-share-requests-list
        v-if="activeTab === 'received'"
        :requests="receivedRequests"
        :is-received="true"
        @accept="handleAccept"
        @reject="handleReject"
      />

      <nuc-share-requests-list
        v-if="activeTab === 'sent'"
        :requests="sentRequests"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShareTabType } from 'atomic'
import { useShareRequests } from 'atomic'

const activeTab = ref<ShareTabType>('received')

const { received, sent, loadAll, acceptRequest, rejectRequest, cancelRequest } =
  useShareRequests()

const receivedRequests = computed(() => received.value ?? [])
const sentRequests = computed(() => sent.value ?? [])

async function handleAccept(id: number): Promise<void> {
  await acceptRequest(id)
}

async function handleReject(id: number): Promise<void> {
  await rejectRequest(id)
}

async function handleCancel(id: number): Promise<void> {
  await cancelRequest(id)
}

onMounted(() => {
  loadAll()
})
</script>

<style lang="scss">
@import 'index';
</style>

