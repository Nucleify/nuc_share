'use client'

import type {
  AppFramework,
  EntityCountResultsType,
  EntityResultsType,
  ShareRequestInterface,
  UseLoadingInterface,
} from 'nucleify'
import {
  apiHandle,
  createEntityCollectionState,
  createEntityScalarState,
  notifyShareEntityAccepted,
  useApiSuccess,
  useLoading,
} from 'nucleify'

const SHARE_URL = '/share'

type ShareListState =
  | EntityResultsType<ShareRequestInterface>
  | ShareRequestInterface[]
type ShareCountState = EntityCountResultsType | number

export interface ShareRequestsInterface {
  received: ShareListState
  sent: ShareListState
  pendingCount: ShareCountState
  loading: UseLoadingInterface['loading']
  loadAll: () => Promise<void>
  getReceived: () => Promise<void>
  getSent: () => Promise<void>
  acceptRequest: (id: number) => Promise<void>
  rejectRequest: (id: number) => Promise<void>
  cancelRequest: (id: number) => Promise<void>
}

function normalizeShareList(payload: unknown): ShareRequestInterface[] {
  if (Array.isArray(payload)) return [...payload] as ShareRequestInterface[]
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data
    if (Array.isArray(inner)) return [...inner] as ShareRequestInterface[]
  }
  return []
}

function getShareList(value: ShareListState): ShareRequestInterface[] {
  if (Array.isArray(value)) return value
  return (value as { value: ShareRequestInterface[] | undefined }).value ?? []
}

export function useShareRequests(
  framework: AppFramework = 'nuxt'
): ShareRequestsInterface {
  const { items: received, setItems: setReceived } =
    createEntityCollectionState<ShareRequestInterface>(framework)
  const { items: sent, setItems: setSent } =
    createEntityCollectionState<ShareRequestInterface>(framework)
  const { value: pendingCount, setValue: setPendingCount } =
    createEntityScalarState(framework, 0)

  const { loading, setLoading } = useLoading()
  const { apiSuccess } = useApiSuccess()

  async function getReceived(): Promise<void> {
    await apiHandle<ShareRequestInterface[]>({
      url: `${SHARE_URL}/received`,
      setLoading,
      onSuccess: (response) => {
        setReceived(normalizeShareList(response))
      },
    })
  }

  async function getSent(): Promise<void> {
    await apiHandle<ShareRequestInterface[]>({
      url: `${SHARE_URL}/sent`,
      setLoading,
      onSuccess: (response) => {
        setSent(normalizeShareList(response))
      },
    })
  }

  async function getPendingCount(): Promise<void> {
    await apiHandle<{ count: number }>({
      url: `${SHARE_URL}/count`,
      onSuccess: (response) => {
        setPendingCount(response.count ?? 0)
      },
    })
  }

  async function loadAll(): Promise<void> {
    await Promise.all([getReceived(), getSent(), getPendingCount()])
  }

  async function acceptRequest(id: number): Promise<void> {
    const pending = getShareList(received).find((r) => r.id === id)

    await apiHandle<{ message: string }>({
      url: `${SHARE_URL}/${id}/accept`,
      method: 'POST',
      setLoading,
      onSuccess: (response) => {
        apiSuccess(response, loadAll)
        if (pending?.entity_type) {
          notifyShareEntityAccepted(pending.entity_type)
        }
      },
    })
  }

  async function rejectRequest(id: number): Promise<void> {
    await apiHandle<{ message: string }>({
      url: `${SHARE_URL}/${id}/reject`,
      method: 'POST',
      setLoading,
      onSuccess: (response) => {
        apiSuccess(response, loadAll)
      },
    })
  }

  async function cancelRequest(id: number): Promise<void> {
    await apiHandle<{ message: string }>({
      url: `${SHARE_URL}/${id}/cancel`,
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
