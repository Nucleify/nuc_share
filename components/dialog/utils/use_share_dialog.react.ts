'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type {
  Friend,
  NucFriendshipObjectInterface,
  NucShareDialogInterface,
  UseShareDialogInterface,
} from 'nucleify'
import { apiHandle, useApiSuccess } from 'nucleify'

function mapAcceptedFriends(
  response: NucFriendshipObjectInterface[] | undefined
): Friend[] {
  return (response ?? [])
    .filter((f) => String(f.status ?? '').toLowerCase() === 'accepted')
    .map((f) => {
      const id = String(f.friend?.id ?? '').trim()
      return {
        id,
        name: f.friend.name,
        email: f.friend.email,
      }
    })
    .filter((f) => f.id.length > 0)
}

export function useShareDialog(
  props: NucShareDialogInterface
): UseShareDialogInterface {
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const { apiSuccess } = useApiSuccess()

  const selectedEntities = useMemo(
    () => props.selectedEntities ?? [],
    [props.selectedEntities]
  )

  const loadFriends = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      await apiHandle<NucFriendshipObjectInterface[]>({
        url: '/friendship/all',
        onSuccess: (response) => {
          setFriends(mapAcceptedFriends(response))
        },
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (props.visible) {
      void loadFriends()
    }
  }, [props.visible, loadFriends])

  const toggleFriend = useCallback((id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }, [])

  const isFriendSelected = useCallback(
    (id: string): boolean => selectedFriendIds.includes(id),
    [selectedFriendIds]
  )

  const handleShare = useCallback(async (): Promise<void> => {
    if (selectedFriendIds.length === 0 || selectedEntities.length === 0) {
      return
    }

    const entityIds = selectedEntities.map((e) => (e as { id: number }).id)

    await apiHandle<{ message: string }>({
      url: '/share',
      method: 'POST',
      data: {
        entity_ids: entityIds,
        entity_type: props.nuiType,
        user_ids: selectedFriendIds,
      },
      setLoading,
      onSuccess: (response: { message: string }) => {
        apiSuccess(
          response,
          () => Promise.resolve(),
          () => props.onUpdateVisible(false),
          'create'
        )
        setSelectedFriendIds([])
      },
    })
  }, [
    apiSuccess,
    props.nuiType,
    props.onUpdateVisible,
    selectedEntities,
    selectedFriendIds,
  ])

  const handleCancel = useCallback(() => {
    setSelectedFriendIds([])
    props.onUpdateVisible(false)
  }, [props.onUpdateVisible])

  const isConfirmDisabled = useMemo(
    () =>
      loading ||
      selectedEntities.length === 0 ||
      selectedFriendIds.length === 0,
    [loading, selectedEntities.length, selectedFriendIds.length]
  )

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
