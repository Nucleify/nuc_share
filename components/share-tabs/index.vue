<template>
  <div class="share-tabs">
    <ad-button
      ad-type="main"
      label="Received"
      :text="activeTab !== 'received'"
      class="tab-button"
      @click="$emit('update:activeTab', 'received')"
    />
    <ad-button
      ad-type="main"
      label="Sent"
      :text="activeTab !== 'sent'"
      class="tab-button"
      @click="$emit('update:activeTab', 'sent')"
    />
  </div>
</template>

<script setup lang="ts">
import type { ShareTabType } from 'atomic'

defineProps<{
  activeTab: ShareTabType
}>()

defineEmits<{
  'update:activeTab': [tab: ShareTabType]
}>()
</script>

<style lang="scss">
@import 'index';
</style>
