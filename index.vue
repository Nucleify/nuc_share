<template>
  <ad-popover
    dismissable
    icon="prime:inbox"
    :position="position"
    popover-class="share-inbox-popover"
    :button-text="isMobile() ? '' : 'Share Inbox'"
    button-class="share-inbox-toggle"
    @show="loadAll"
  >
    <nuc-share-popover />
  </ad-popover>
</template>

<script setup lang="ts">
import { useShareRequests } from 'nucleify'

defineProps<{
  position: PositionType
}>()

const { loadAll } = useShareRequests()
</script>

<style lang="scss">
@import 'index';
</style>
