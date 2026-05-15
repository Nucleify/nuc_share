import { ref } from 'vue'

import { apiHandle, useApiSuccess, useLoading } from 'nucleify'

import type { ShareRequestInterface, ShareRequestsInterface } from '../types'

import { notifyShareEntityAccepted } from './share_entity_refresh_bus'

// Global singleton state
const received = ref<ShareRequestInterface[]>([])
const sent = ref<ShareRequestInterface[]>([])
const pendingCount = ref(0)

/** Rozpakuj listę z `$fetch` / `apiHandle` (tablica albo `{ data: [...] }`). */
function normalizeShareList(payload: unknown): ShareRequestInterface[] {
  if (Array.isArray(payload)) return [...payload] as ShareRequestInterface[]
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data
    if (Array.isArray(inner)) return [...inner] as ShareRequestInterface[]
  }
  return []
}

export function useShareRequests(): ShareRequestsInterface {
  const { loading, setLoading } = useLoading()
  const { apiSuccess } = useApiSuccess()

  async function getReceived(): Promise<void> {
    await apiHandle<ShareRequestInterface[]>({
      url: apiUrl() + '/share/received',
      setLoading,
      onSuccess: (response) => {
        received.value = normalizeShareList(response)
      },
    })
  }

  async function getSent(): Promise<void> {
    await apiHandle<ShareRequestInterface[]>({
      url: apiUrl() + '/share/sent',
      setLoading,
      onSuccess: (response) => {
        sent.value = normalizeShareList(response)
      },
    })
  }

  async function getPendingCount(): Promise<void> {
    await apiHandle<{ count: number }>({
      url: apiUrl() + '/share/count',
      onSuccess: (response) => {
        pendingCount.value = response.count ?? 0
      },
    })
  }

  async function loadAll(): Promise<void> {
    await Promise.all([getReceived(), getSent(), getPendingCount()])
  }

  async function acceptRequest(id: number): Promise<void> {
    const pending = received.value.find((r) => r.id === id)
    const entityTypeForRefresh = pending?.entity_type
    await apiHandle<{ message: string }>({
      url: apiUrl() + '/share/' + id + '/accept',
      method: 'POST',
      setLoading,
      onSuccess: (response) => {
        apiSuccess(response, loadAll)
        if (entityTypeForRefresh)
          notifyShareEntityAccepted(String(entityTypeForRefresh))
      },
    })
  }

  async function rejectRequest(id: number): Promise<void> {
    await apiHandle<{ message: string }>({
      url: apiUrl() + '/share/' + id + '/reject',
      method: 'POST',
      setLoading,
      onSuccess: (response) => {
        apiSuccess(response, loadAll)
      },
    })
  }

  async function cancelRequest(id: number): Promise<void> {
    await apiHandle<{ message: string }>({
      url: apiUrl() + '/share/' + id + '/cancel',
      method: 'POST',
      setLoading,
      onSuccess: (response) => {
        apiSuccess(response, loadAll)
      },
    })
  }

  return {
    received,
    sent,
    pendingCount,
    loading,
    loadAll,
    getReceived,
    getSent,
    acceptRequest,
    rejectRequest,
    cancelRequest,
  }
}
