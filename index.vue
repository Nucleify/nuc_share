<template>
  <ad-popover
    dismissable
    :icon="variant === 'sidebar' ? undefined : 'prime:inbox'"
    :position="position"
    popover-class="share-inbox-popover"
    :button-text="
      variant === 'sidebar' ? undefined : isMobile() ? '' : 'Share Inbox'
    "
    button-class="share-inbox-toggle"
    @show="loadAll"
  >
    <template v-if="variant === 'sidebar'" #trigger="{ toggle }">
      <button type="button" class="nuc-sidebar-link" @click="toggle">
        <ad-icon icon="prime:inbox" size="1.25em" />
        <span>Share Inbox</span>
      </button>
    </template>

    <nuc-share-popover />
  </ad-popover>
</template>

<script setup lang="ts">
import { useShareRequests } from 'nucleify'

withDefaults(
  defineProps<{
    position: PositionType
    variant?: 'default' | 'sidebar'
  }>(),
  {
    variant: 'default',
  }
)

const { loadAll } = useShareRequests()
</script>

<style lang="scss">
@import 'index';
</style>
