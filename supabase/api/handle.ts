import { apiNotHandled, dispatchAuthRoutes, withGatewayUser } from 'nuc_api'
import type { ApiContext, ApiHandlerResult } from 'nuc_server'

import { shareRoutes } from './share_routes'

export async function handleShareApi(
  ctx: ApiContext
): Promise<ApiHandlerResult> {
  if (ctx.segments[0] !== 'share') return apiNotHandled()

  return withGatewayUser(ctx, async (c, userId) => {
    const result = await dispatchAuthRoutes(shareRoutes, c, userId)
    return result ?? apiNotHandled()
  })
}
