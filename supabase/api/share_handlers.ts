import type { ApiContext } from 'nuc_api'
import {
  apiError,
  apiOk,
  asStringArray,
  fetchUserProfiles,
  fromSupabaseError,
  normalizeUuid,
  nowIso,
  readJsonBody,
} from 'nuc_api'
import type { ApiHandlerResult } from 'nuc_server'
import { formatRowsResponseTimestamps } from 'nuc_server'

import {
  asEntityIdsJson,
  asShareEntityNumericIds,
  copySharedEntitiesToReceiver,
  mapShareRowForClient,
  type ShareRow,
  tableForShareEntityType,
} from './share_helpers'

export async function handleShareReceived(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult | null> {
  return listShareRequests(ctx, userId, 'receiver_id', true)
}

export async function handleShareSent(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult | null> {
  return listShareRequests(ctx, userId, 'sender_id', false)
}

async function listShareRequests(
  ctx: ApiContext,
  userId: string,
  column: 'receiver_id' | 'sender_id',
  pendingOnly: boolean
): Promise<ApiHandlerResult> {
  let q = ctx.supabase
    .from('share_requests')
    .select('*')
    .eq(column, userId)
    .order('created_at', { ascending: false })
  if (pendingOnly) q = q.eq('status', 'pending')
  const { data, error } = await q
  if (error) return fromSupabaseError(error)
  const raw = (data ?? []) as ShareRow[]
  const profiles = await fetchUserProfiles(
    ctx.supabase,
    raw.map((r) =>
      normalizeUuid(column === 'receiver_id' ? r.sender_id : r.receiver_id)
    )
  )
  return apiOk(
    ctx,
    raw.map((r) =>
      mapShareRowForClient(
        formatRowsResponseTimestamps([r])[0] as ShareRow,
        profiles
      )
    )
  )
}

export async function handleShareCount(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult | null> {
  const { count, error } = await ctx.supabase
    .from('share_requests')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('status', 'pending')
  return error ? fromSupabaseError(error) : apiOk(ctx, { count: count ?? 0 })
}

export async function handleSharePost(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult> {
  const body = await readJsonBody(ctx)
  const entityType = String(body?.entity_type ?? '').trim()
  const entityIds = asEntityIdsJson(body?.entity_ids)
  const receiverIds = asStringArray(body?.user_ids)
  if (!entityType) return apiError(422, 'entity_type is required')
  if (!entityIds.length)
    return apiError(422, 'entity_ids must be a non-empty array')
  if (!receiverIds.length)
    return apiError(422, 'user_ids must be a non-empty array')

  const rows = receiverIds
    .map((rid) => normalizeUuid(rid))
    .filter((rid) => rid && rid !== userId)
    .map((receiver_id) => ({
      sender_id: userId,
      receiver_id,
      entity_type: entityType,
      entity_ids: entityIds,
      status: 'pending',
      created_at: nowIso(),
      updated_at: nowIso(),
    }))
  if (!rows.length) return apiError(422, 'No valid recipients')

  const { data, error } = await ctx.supabase
    .from('share_requests')
    .insert(rows)
    .select('*')
  if (error) return fromSupabaseError(error, 400)
  return apiOk(
    ctx,
    {
      message: 'Share requests sent.',
      requests: formatRowsResponseTimestamps((data ?? []) as unknown[]),
    },
    201
  )
}

export async function handleShareAction(
  ctx: ApiContext,
  userId: string
): Promise<ApiHandlerResult | null> {
  const action = ctx.segments[2]
  if (!action || !['accept', 'reject', 'cancel'].includes(action)) return null

  const id = Number(ctx.segments[1])
  if (!Number.isFinite(id) || id <= 0)
    return apiError(422, 'Invalid share request id')

  const { data: row, error: fetchErr } = await ctx.supabase
    .from('share_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (fetchErr) return fromSupabaseError(fetchErr)
  if (!row) return apiError(404, 'Share request not found')

  const r = row as ShareRow
  if (String(r.status) !== 'pending')
    return apiError(409, 'Request is no longer pending')

  if (action === 'accept' || action === 'reject') {
    if (normalizeUuid(r.receiver_id) !== userId)
      return apiError(403, 'Not allowed')
    if (action === 'accept') {
      const table = tableForShareEntityType(r.entity_type)
      if (!table) {
        return apiError(
          422,
          `Accepting share is not supported for entity_type "${String(r.entity_type)}".`
        )
      }
      const { error: copyErr } = await copySharedEntitiesToReceiver(
        ctx.supabase,
        {
          table,
          entityIds: asShareEntityNumericIds(r.entity_ids),
          receiverId: normalizeUuid(r.receiver_id),
        }
      )
      if (copyErr) return apiError(400, copyErr)
    }
    const { error: upErr } = await ctx.supabase
      .from('share_requests')
      .update({
        status: action === 'accept' ? 'accepted' : 'rejected',
        updated_at: nowIso(),
      })
      .eq('id', id)
    if (upErr) return fromSupabaseError(upErr)
    return apiOk(ctx, {
      message:
        action === 'accept'
          ? 'Share request accepted.'
          : 'Share request rejected.',
    })
  }

  if (normalizeUuid(r.sender_id) !== userId) return apiError(403, 'Not allowed')
  const { error: delErr } = await ctx.supabase
    .from('share_requests')
    .delete()
    .eq('id', id)
  return delErr
    ? fromSupabaseError(delErr)
    : apiOk(ctx, { message: 'Share request cancelled.' })
}
