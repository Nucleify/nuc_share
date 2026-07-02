import type { ComputedRef, Ref } from 'vue'

export interface NucShareDialogInterface {
  nuiType?: string
  visible?: boolean
  selectedEntities?: unknown[]
}

export interface Friend {
  id: string
  name: string
  email?: string
}

export interface UseShareDialogInterface {
  friends: Ref<Friend[]>
  selectedFriendIds: Ref<string[]>
  selectedEntities: ComputedRef<unknown[]>
  loading: Ref<boolean>
  isConfirmDisabled: ComputedRef<boolean>
  handleShare: () => Promise<void>
  handleCancel: () => void
  toggleFriend: (id: string) => void
  isFriendSelected: (id: string) => boolean
}
