'use client'

import { type JSX, useEffect, useRef, useState } from 'react'

import type { ShareRequestInterface, ShareTabType } from 'nucleify'
import { AdHeading, NucShareRequestsList, NucShareTabs } from 'nucleify'

import './_index.scss'

export interface NucSharePopoverProps {
  received: ShareRequestInterface[]
  sent: ShareRequestInterface[]
  getReceived: () => Promise<void>
  getSent: () => Promise<void>
  acceptRequest: (id: number) => Promise<void>
  rejectRequest: (id: number) => Promise<void>
  cancelRequest: (id: number) => Promise<void>
}

export function NucSharePopover({
  received,
  sent,
  getReceived,
  getSent,
  acceptRequest,
  rejectRequest,
  cancelRequest,
}: NucSharePopoverProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<ShareTabType>('received')
  const previousTab = useRef(activeTab)

  useEffect(() => {
    if (previousTab.current === activeTab) return
    previousTab.current = activeTab
    if (activeTab === 'received') void getReceived()
    if (activeTab === 'sent') void getSent()
  }, [activeTab, getReceived, getSent])

  return (
    <div className="share-popover-container">
      <div className="share-popover-header">
        <AdHeading tag={3} text="Share Requests" />
      </div>

      <div className="share-popover-content">
        <NucShareTabs activeTab={activeTab} onUpdateActiveTab={setActiveTab} />

        {activeTab === 'received' ? (
          <NucShareRequestsList
            requests={received}
            isReceived
            onAccept={(id) => void acceptRequest(id)}
            onReject={(id) => void rejectRequest(id)}
          />
        ) : null}

        {activeTab === 'sent' ? (
          <NucShareRequestsList
            requests={sent}
            onCancel={(id) => void cancelRequest(id)}
          />
        ) : null}
      </div>
    </div>
  )
}
