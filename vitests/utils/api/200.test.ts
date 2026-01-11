import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import * as atomic from 'atomic'

import { mockShareRequests } from '../../constants'

describe('useShareRequests', (): void => {
  const requests: atomic.ShareRequestsInterface = atomic.useShareRequests()

  beforeEach((): void => {
    vi.clearAllMocks()
    atomic.mockGlobalFetch(vi, mockShareRequests)
  })

  it('loadAll fetches received, sent, and count', async (): Promise<void> => {
    await requests.loadAll()

    expect(
      (globalThis as unknown as { $fetch: Mock }).$fetch
    ).toHaveBeenCalledWith(
      expect.stringContaining('share/received'),
      expect.objectContaining({ method: 'GET' })
    )
    expect(
      (globalThis as unknown as { $fetch: Mock }).$fetch
    ).toHaveBeenCalledWith(
      expect.stringContaining('share/sent'),
      expect.objectContaining({ method: 'GET' })
    )
    expect(
      (globalThis as unknown as { $fetch: Mock }).$fetch
    ).toHaveBeenCalledWith(
      expect.stringContaining('share/count'),
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('acceptRequest sends POST to accept endpoint', async (): Promise<void> => {
    await requests.acceptRequest(1)

    expect(
      (globalThis as unknown as { $fetch: Mock }).$fetch
    ).toHaveBeenCalledWith(
      expect.stringContaining('share/1/accept'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('rejectRequest sends POST to reject endpoint', async (): Promise<void> => {
    await requests.rejectRequest(1)

    expect(
      (globalThis as unknown as { $fetch: Mock }).$fetch
    ).toHaveBeenCalledWith(
      expect.stringContaining('share/1/reject'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('cancelRequest sends POST to cancel endpoint', async (): Promise<void> => {
    await requests.cancelRequest(1)

    expect(
      (globalThis as unknown as { $fetch: Mock }).$fetch
    ).toHaveBeenCalledWith(
      expect.stringContaining('share/1/cancel'),
      expect.objectContaining({ method: 'POST' })
    )
  })
})
