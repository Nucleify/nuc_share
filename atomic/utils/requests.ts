import { ref } from 'vue'

import { apiHandle, useApiSuccess, useLoading } from 'atomic'

import type { ShareRequestInterface, ShareRequestsInterface } from '../types'

// Global singleton state
const received = ref<ShareRequestInterface[]>([])
const sent = ref<ShareRequestInterface[]>([])
const pendingCount = ref(0)

export function useShareRequests(): ShareRequestsInterface {
  const { loading, setLoading } = useLoading()
  const { apiSuccess } = useApiSuccess()

  async function getReceived(): Promise<void> {
    await apiHandle<ShareRequestInterface[]>({
      url: apiUrl() + '/share/received',
      setLoading,
      onSuccess: (response) => {
        received.value = response ?? []
      },
    })
  }

  async function getSent(): Promise<void> {
    await apiHandle<ShareRequestInterface[]>({
      url: apiUrl() + '/share/sent',
      setLoading,
      onSuccess: (response) => {
        sent.value = response ?? []
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
    await apiHandle<{ message: string }>({
      url: apiUrl() + '/share/' + id + '/accept',
      method: 'POST',
      setLoading,
      onSuccess: (response) => {
        apiSuccess(response, loadAll)
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
    acceptRequest,
    rejectRequest,
    cancelRequest,
  }
}
