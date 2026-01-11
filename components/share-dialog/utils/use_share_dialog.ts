import { computed, ref, watch } from 'vue'

import type { NucFriendshipObjectInterface } from 'atomic'
import { apiHandle, friendshipRequests, useApiSuccess } from 'atomic'

import type {
  Friend,
  NucShareDialogInterface,
  UseShareDialogInterface,
} from '..'

export function useShareDialog(
  props: NucShareDialogInterface,
  emits: {
    (e: 'update:visible', value: boolean): void
  }
): UseShareDialogInterface {
  const friends = ref<Friend[]>([])
  const selectedFriendIds = ref<number[]>([])
  const loading = ref(false)

  const selectedEntities = computed(() => props.selectedEntities || [])

  const friendship = friendshipRequests()
  const { apiSuccess } = useApiSuccess()

  async function loadFriends(): Promise<void> {
    loading.value = true
    await friendship.getAllFriendships()
    friends.value = (friendship.results.value || [])
      .filter((f: NucFriendshipObjectInterface) => f.status === 'accepted')
      .map((f: NucFriendshipObjectInterface) => ({
        id: f.friend.id,
        name: f.friend.name,
        email: f.friend.email,
      }))
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

  function toggleFriend(id: number): void {
    const index = selectedFriendIds.value.indexOf(id)
    if (index === -1) {
      selectedFriendIds.value.push(id)
    } else {
      selectedFriendIds.value.splice(index, 1)
    }
  }

  function isFriendSelected(id: number): boolean {
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
      url: apiUrl() + '/share',
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
