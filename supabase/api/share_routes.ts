import type { ApiAuthRoute } from 'nuc_api'
import { whenAuth } from 'nuc_api'

import {
  handleShareAction,
  handleShareCount,
  handleSharePost,
  handleShareReceived,
  handleShareSent,
} from './share_handlers'

/** POST /share */
export const routeSharePost = whenAuth(
  { method: 'POST', len: 1 },
  handleSharePost
)

/** GET /share/received */
export const routeShareReceived = whenAuth(
  { method: 'GET', path: [undefined, 'received'] },
  handleShareReceived
)

/** GET /share/sent */
export const routeShareSent = whenAuth(
  { method: 'GET', path: [undefined, 'sent'] },
  handleShareSent
)

/** GET /share/count */
export const routeShareCount = whenAuth(
  { method: 'GET', path: [undefined, 'count'] },
  handleShareCount
)

/** POST /share/:id/:action — accept · reject · cancel */
export const routeShareAction = whenAuth(
  { method: 'POST', len: 3 },
  handleShareAction
)

export const shareRoutes: ApiAuthRoute[] = [
  routeSharePost,
  routeShareReceived,
  routeShareSent,
  routeShareCount,
  routeShareAction,
]
