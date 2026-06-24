'use client'

import type { JSX } from 'react'

import type { PositionType } from 'nucleify'
import {
  AdPopover,
  isMobile,
  NucSharePopover,
  useShareRequests,
} from 'nucleify'

import './_index.scss'

export function NucShare({
  position,
}: {
  position: PositionType
}): JSX.Element {
  const share = useShareRequests('next')

  return (
    <AdPopover
      dismissable
      icon="prime:inbox"
      position={position}
      popoverClass="share-inbox-popover"
      buttonText={isMobile() ? '' : 'Share Inbox'}
      buttonClass="share-inbox-toggle"
      onShow={() => void share.loadAll()}
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
