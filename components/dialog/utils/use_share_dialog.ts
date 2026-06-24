import { computed, ref, watch } from 'vue'

import type {
  Friend,
  NucFriendshipObjectInterface,
  NucShareDialogInterface,
  UseShareDialogInterface,
} from 'nucleify'
import { apiHandle, friendshipRequests, useApiSuccess } from 'nucleify'

export function useShareDialog(
  props: NucShareDialogInterface,
  emits: {
    (e: 'update:visible', value: boolean): void
  }
): UseShareDialogInterface {
  const friends = ref<Friend[]>([])
  const selectedFriendIds = ref<string[]>([])
  const loading = ref(false)

  const selectedEntities = computed(() => props.selectedEntities || [])

  const friendship = friendshipRequests()
  const { apiSuccess } = useApiSuccess()

  async function loadFriends(): Promise<void> {
    loading.value = true
    await friendship.getAllFriendships()
    friends.value = (friendship.results.value || [])
      .filter(
        (f: NucFriendshipObjectInterface) =>
          String(f.status ?? '').toLowerCase() === 'accepted'
      )
      .map((f: NucFriendshipObjectInterface) => {
        const id = String(f.friend?.id ?? '').trim()
        return {
          id,
          name: f.friend.name,
          email: f.friend.email,
        }
      })
      .filter((f) => f.id.length > 0)
    loading.value = false
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        loadFriends()
      }
    },
    { immediate: true }
  )

  function toggleFriend(id: string): void {
    const index = selectedFriendIds.value.indexOf(id)
    if (index === -1) {
      selectedFriendIds.value.push(id)
    } else {
      selectedFriendIds.value.splice(index, 1)
    }
  }

  function isFriendSelected(id: string): boolean {
    return selectedFriendIds.value.includes(id)
  }

  async function handleShare(): Promise<void> {
    if (
      selectedFriendIds.value.length === 0 ||
      selectedEntities.value.length === 0
    ) {
      return
    }

    const entityIds = selectedEntities.value.map(
      (e) => (e as { id: number }).id
    )

    await apiHandle<{ message: string }>({
      url: '/share',
      method: 'POST',
      data: {
        entity_ids: entityIds,
        entity_type: props.adType,
        user_ids: selectedFriendIds.value,
      },
      setLoading: (val: boolean) => {
        loading.value = val
      },
      onSuccess: (response: { message: string }) => {
        apiSuccess(
          response,
          () => Promise.resolve(),
          () => emits('update:visible', false),
          'create'
        )
        selectedFriendIds.value = []
      },
    })
  }

  function handleCancel(): void {
    selectedFriendIds.value = []
    emits('update:visible', false)
  }

  const isConfirmDisabled = computed(() => {
    return (
      selectedEntities.value.length === 0 ||
      selectedFriendIds.value.length === 0
    )
  })

  return {
    friends,
    selectedFriendIds,
    selectedEntities,
    loading,
    isConfirmDisabled,
    handleShare,
    handleCancel,
    toggleFriend,
    isFriendSelected,
  }
}
