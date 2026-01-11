<template>
  <ad-popover
    v-if="!loading"
    dismissable
    icon="prime:inbox"
    :position="position"
    popover-class="share-inbox-popover"
    :button-text="isMobile() ? '' : 'Share Inbox'"
    button-class="share-inbox-toggle"
  >
    <nuc-share-popover />
  </ad-popover>
</template>

<script setup lang="ts">
import { useShareRequests } from 'atomic'

defineProps<{
  position: PositionType
}>()

const { loading, loadAll } = useShareRequests()

onMounted(() => {
  loadAll()
})
</script>

<style lang="scss">
@import 'index';
</style>

