'use client'

import type { JSX } from 'react'

import type { PositionType } from 'nucleify'
import {
  AdIcon,
  AdPopover,
  isMobile,
  NucSharePopover,
  useShareRequests,
} from 'nucleify'

import './_index.scss'

export function NucShare({
  position,
  variant = 'default',
}: {
  position: PositionType
  variant?: 'default' | 'sidebar'
}): JSX.Element {
  const share = useShareRequests('next')

  return (
    <AdPopover
      dismissable
      icon={variant === 'sidebar' ? undefined : 'prime:inbox'}
      position={position}
      popoverClass="share-inbox-popover"
      buttonText={
        variant === 'sidebar' ? undefined : isMobile() ? '' : 'Share Inbox'
      }
      buttonClass="share-inbox-toggle"
      onShow={() => void share.loadAll()}
      renderTrigger={
        variant === 'sidebar'
          ? (toggle) => (
              <button
                type="button"
                className="nuc-sidebar-link"
                onClick={toggle}
              >
                <AdIcon icon="prime:inbox" size="1.25em" />
                <span>Share Inbox</span>
              </button>
            )
          : undefined
      }
    >
      <NucSharePopover
        received={share.received}
        sent={share.sent}
        getReceived={share.getReceived}
        getSent={share.getSent}
        acceptRequest={share.acceptRequest}
        rejectRequest={share.rejectRequest}
        cancelRequest={share.cancelRequest}
      />
    </AdPopover>
  )
}

export default NucShare
