import type { ComputedRef, Ref } from 'vue'

export interface NucShareDialogInterface {
  adType?: string
  visible?: boolean
  selectedEntities?: unknown[]
}

export interface Friend {
  id: number
  name: string
  email?: string
}

export interface UseShareDialogInterface {
  friends: Ref<Friend[]>
  selectedFriendIds: Ref<number[]>
  selectedEntities: ComputedRef<unknown[]>
  loading: Ref<boolean>
  isConfirmDisabled: ComputedRef<boolean>
  handleShare: () => Promise<void>
  handleCancel: () => void
  toggleFriend: (id: number) => void
  isFriendSelected: (id: number) => boolean
}
