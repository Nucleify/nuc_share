export interface NucShareDialogInterface {
  adType?: AdTypeType
  visible?: boolean
  selectedEntities?: unknown[]
  onUpdateVisible: (visible: boolean) => void
}

export interface Friend {
  id: string
  name: string
  email?: string
}

export interface UseShareDialogInterface {
  friends: Friend[]
  selectedFriendIds: string[]
  selectedEntities: unknown[]
  loading: boolean
  isConfirmDisabled: boolean
  handleShare: () => Promise<void>
  handleCancel: () => void
  toggleFriend: (id: string) => void
  isFriendSelected: (id: string) => boolean
}
