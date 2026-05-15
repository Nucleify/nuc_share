import { readBody } from 'h3'

import type {
  ApiContext,
  ApiHandlerResult,
  Json,
} from '../../../../nuxt/server/api/_types'
import { formatRowsResponseTimestamps } from '../../../../nuxt/server/api/format_timestamptz_response'
import { gatewayUserFromJwt } from '../../../../nuxt/server/api/gateway_auth'

type ShareRow = Record<string, unknown>

function normalizeUuid(v: unknown): string {
  if (v == null || v === '') return ''
  return String(v).trim()
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => String(x).trim()).filter(Boolean)
}

function asEntityIdsJson(v: unknown): unknown[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => x)
}

async function fetchProfiles(
  supabase: ApiContext['supabase'],
  ids: string[]
): Promise<Map<string, Record<string, unknown>>> {
  const uniq = [...new Set(ids.filter(Boolean))]
  if (uniq.length === 0) return new Map()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id,name,email')
    .in('id', uniq)
  if (error || !data) return new Map()
  const m = new Map<string, Record<string, unknown>>()
  for (const row of data) {
    const r = row as Record<string, unknown>
    const id = normalizeUuid(r.id)
    if (id) m.set(id, r)
  }
  return m
}

/** Tabele z `user_id` (nuc_entities), które można przenieść po akceptacji share. */
type ShareAssignableTable = 'articles' | 'contacts' | 'money'

const ENTITY_TABLE_BY_TYPE: Record<string, ShareAssignableTable> = {
  article: 'articles',
  contact: 'contacts',
  money: 'money',
}

function tableForShareEntityType(
  entityType: unknown
): ShareAssignableTable | null {
  const key = String(entityType ?? '')
    .trim()
    .toLowerCase()
  return ENTITY_TABLE_BY_TYPE[key] ?? null
}

function asShareEntityNumericIds(v: unknown): number[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
}

/**
 * Po akceptacji: **kopia** rekordów dla odbiorcy (`user_id` = receiver).
 * Oryginały nadawcy pozostają bez zmian.
 */
async function copySharedEntitiesToReceiver(
  supabase: ApiContext['supabase'],
  opts: {
    table: ShareAssignableTable
    entityIds: number[]
    receiverId: string
  }
): Promise<{ error: string | null }> {
  const { table, entityIds, receiverId } = opts
  if (entityIds.length === 0) return { error: null }

  const { data: rows, error: selErr } = await supabase
    .from(table)
    .select('*')
    .in('id', entityIds)

  if (selErr) return { error: selErr.message }
  if (!rows?.length) return { error: 'No matching entities found to copy.' }
  if (rows.length !== entityIds.length)
    return { error: 'Some entity ids were not found.' }

  const now = new Date().toISOString()
  const inserts = (rows as Record<string, unknown>[]).map((row) => {
    const copy: Record<string, unknown> = { ...row }
    delete copy.id
    if (table === 'contacts') delete copy.full_name
    copy.user_id = receiverId
    copy.created_at = now
    copy.updated_at = now
    return copy
  })

  const { error: insErr } = await supabase.from(table).insert(inserts)
  return { error: insErr?.message ?? null }
}

function mapShareRowForClient(
  row: ShareRow,
  profiles: Map<string, Record<string, unknown>>
): ShareRow {
  const senderId = normalizeUuid(row.sender_id)
  const receiverId = normalizeUuid(row.receiver_id)
  const sp = profiles.get(senderId) ?? {}
  const rp = profiles.get(receiverId) ?? {}
  const entityIdsRaw = row.entity_ids
  const entity_ids = Array.isArray(entityIdsRaw)
    ? entityIdsRaw.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
    : []
  return {
    ...row,
    entity_ids,
    sender: {
      id: senderId,
      name: String(sp.name ?? ''),
      email: String(sp.email ?? ''),
    },
    receiver: {
      id: receiverId,
      name: String(rp.name ?? ''),
      email: String(rp.email ?? ''),
    },
  }
}

export async function handleShareApi(
  ctx: ApiContext
): Promise<ApiHandlerResult> {
  const { segments, method, supabase, ok } = ctx
  if (segments[0] !== 'share') return { handled: false }

  const auth = await gatewayUserFromJwt(supabase, ctx.event)
  if ('error' in auth)
    return {
      handled: true,
      status: auth.status,
      body: { error: auth.error },
    }
  const userId = normalizeUuid(auth.user.id)

  /** POST /share — body: { entity_type, entity_ids, user_ids } (user_ids = odbiorcy). */
  if (method === 'POST' && segments.length === 1) {
    const body = (await readBody(ctx.event)) as Json
    const entityType = String(body?.entity_type ?? '').trim()
    const entityIds = asEntityIdsJson(body?.entity_ids)
    const receiverIds = asStringArray(body?.user_ids)

    if (!entityType)
      return {
        handled: true,
        status: 422,
        body: { error: 'entity_type is required' },
      }
    if (entityIds.length === 0)
      return {
        handled: true,
        status: 422,
        body: { error: 'entity_ids must be a non-empty array' },
      }
    if (receiverIds.length === 0)
      return {
        handled: true,
        status: 422,
        body: { error: 'user_ids must be a non-empty array' },
      }

    const rows = receiverIds
      .map((rid) => normalizeUuid(rid))
      .filter((rid) => rid && rid !== userId)
      .map((receiver_id) => ({
        sender_id: userId,
        receiver_id,
        entity_type: entityType,
        entity_ids: entityIds,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

    if (rows.length === 0)
      return {
        handled: true,
        status: 422,
        body: { error: 'No valid recipients' },
      }

    const { data, error } = await supabase
      .from('share_requests')
      .insert(rows)
      .select('*')

    if (error)
      return { handled: true, status: 400, body: { error: error.message } }

    return {
      handled: true,
      status: 201,
      body: ok({
        message: 'Share requests sent.',
        requests: formatRowsResponseTimestamps((data ?? []) as unknown[]),
      }),
    }
  }

  /** GET /share/received — oczekujące, gdzie ja jestem odbiorcą. */
  if (method === 'GET' && segments[1] === 'received') {
    const { data, error } = await supabase
      .from('share_requests')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error)
      return { handled: true, status: 500, body: { error: error.message } }
    const raw = (data ?? []) as ShareRow[]
    const senderIds = raw.map((r) => normalizeUuid(r.sender_id))
    const profiles = await fetchProfiles(supabase, senderIds)
    const shaped = raw.map((r) => {
      const formatted = formatRowsResponseTimestamps([r])[0] as ShareRow
      return mapShareRowForClient(formatted, profiles)
    })
    return { handled: true, body: ok(shaped) }
  }

  /** GET /share/sent — wszystkie wysłane przeze mnie. */
  if (method === 'GET' && segments[1] === 'sent') {
    const { data, error } = await supabase
      .from('share_requests')
      .select('*')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
    if (error)
      return { handled: true, status: 500, body: { error: error.message } }
    const raw = (data ?? []) as ShareRow[]
    const recvIds = raw.map((r) => normalizeUuid(r.receiver_id))
    const profiles = await fetchProfiles(supabase, recvIds)
    const shaped = raw.map((r) => {
      const formatted = formatRowsResponseTimestamps([r])[0] as ShareRow
      return mapShareRowForClient(formatted, profiles)
    })
    return { handled: true, body: ok(shaped) }
  }

  /** GET /share/count — liczba oczekujących ode mnie (jako odbiorca). */
  if (method === 'GET' && segments[1] === 'count') {
    const { count, error } = await supabase
      .from('share_requests')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('status', 'pending')
    if (error)
      return { handled: true, status: 500, body: { error: error.message } }
    return { handled: true, body: ok({ count: count ?? 0 }) }
  }

  /** POST /share/:id/accept | reject | cancel */
  if (
    method === 'POST' &&
    segments.length === 3 &&
    segments[2] &&
    ['accept', 'reject', 'cancel'].includes(segments[2])
  ) {
    const idRaw = segments[1]
    const id = Number(idRaw)
    if (!Number.isFinite(id) || id <= 0)
      return {
        handled: true,
        status: 422,
        body: { error: 'Invalid share request id' },
      }

    const action = segments[2]
    const { data: row, error: fetchErr } = await supabase
      .from('share_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !row)
      return {
        handled: true,
        status: fetchErr ? 500 : 404,
        body: { error: fetchErr?.message ?? 'Share request not found' },
      }

    const r = row as ShareRow
    if (String(r.status) !== 'pending')
      return {
        handled: true,
        status: 409,
        body: { error: 'Request is no longer pending' },
      }

    if (action === 'accept' || action === 'reject') {
      if (normalizeUuid(r.receiver_id) !== userId)
        return {
          handled: true,
          status: 403,
          body: { error: 'Not allowed' },
        }

      if (action === 'accept') {
        const table = tableForShareEntityType(r.entity_type)
        if (!table)
          return {
            handled: true,
            status: 422,
            body: {
              error: `Accepting share is not supported for entity_type "${String(r.entity_type)}".`,
            },
          }
        const entityIds = asShareEntityNumericIds(r.entity_ids)
        const receiverId = normalizeUuid(r.receiver_id)
        const { error: copyErr } = await copySharedEntitiesToReceiver(
          supabase,
          { table, entityIds, receiverId }
        )
        if (copyErr)
          return {
            handled: true,
            status: 400,
            body: { error: copyErr },
          }
      }

      const nextStatus = action === 'accept' ? 'accepted' : 'rejected'
      const { error: upErr } = await supabase
        .from('share_requests')
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (upErr)
        return { handled: true, status: 500, body: { error: upErr.message } }
      return {
        handled: true,
        body: ok({
          message:
            action === 'accept'
              ? 'Share request accepted.'
              : 'Share request rejected.',
        }),
      }
    }

    /** cancel — tylko nadawca */
    if (normalizeUuid(r.sender_id) !== userId)
      return {
        handled: true,
        status: 403,
        body: { error: 'Not allowed' },
      }
    const { error: delErr } = await supabase
      .from('share_requests')
      .delete()
      .eq('id', id)
    if (delErr)
      return { handled: true, status: 500, body: { error: delErr.message } }
    return {
      handled: true,
      body: ok({ message: 'Share request cancelled.' }),
    }
  }

  return { handled: false }
}
