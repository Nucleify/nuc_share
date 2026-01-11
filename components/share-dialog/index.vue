<template>
  <nuc-dialog
    :entity="props.adType"
    :visible="props.visible && !loading"
    :modal="true"
    :draggable="false"
    title="Share Entities"
    action="share"
    cancel-button-label="Cancel"
    confirm-button-label="Share"
    :confirm-button-disabled="isConfirmDisabled"
    :confirm="handleShare"
    :close="handleCancel"
    class="share-dialog"
    @update:visible="emits('update:visible', $event)"
  >
    <template #content>
      <div class="share-dialog-content">
        <div v-if="selectedEntities.length > 0" class="share-dialog-info">
          Selected count: {{ selectedEntities.length }}
        </div>
        <div v-else class="share-dialog-warning">
          No items selected. Select items in the table first.
        </div>

        <ad-heading :tag="5" text="Select Users" class="share-dialog-subtitle" />

        <div class="share-dialog-friends">
          <label
            v-for="friend in friends"
            :key="friend.id"
            class="share-dialog-friend"
          >
            <ad-checkbox
              :ad-type="props.adType"
              :model-value="isFriendSelected(friend.id)"
              :binary="true"
              @change="toggleFriend(friend.id)"
            />
            <div class="share-dialog-friend-info">
              <span class="share-dialog-friend-name">
                {{ friend.name }}
              </span>
              <span
                v-if="friend.email"
                class="share-dialog-friend-email"
              >
                {{ friend.email }}
              </span>
            </div>
          </label>
        </div>
      </div>
    </template>
  </nuc-dialog>
</template>

<script setup lang="ts">
import type { NucShareDialogInterface } from 'atomic'
import { useShareDialog } from 'atomic'

const props = defineProps<NucShareDialogInterface>()
const emits = defineEmits(['update:visible'])

const {
  friends,
  selectedEntities,
  loading,
  isConfirmDisabled,
  handleShare,
  handleCancel,
  toggleFriend,
  isFriendSelected,
} = useShareDialog(props, emits)
</script>

<style lang="scss">
@import 'index';
</style>

