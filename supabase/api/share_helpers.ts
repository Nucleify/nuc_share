import { normalizeUuid } from 'nuc_api'
import type { ApiContext } from 'nuc_server'

export type ShareRow = Record<string, unknown>
export type ShareAssignableTable = 'articles' | 'contacts' | 'money'

const ENTITY_TABLE_BY_TYPE: Record<string, ShareAssignableTable> = {
  article: 'articles',
  contact: 'contacts',
  money: 'money',
}

export function asEntityIdsJson(v: unknown): unknown[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => x)
}

export function tableForShareEntityType(
  entityType: unknown
): ShareAssignableTable | null {
  const key = String(entityType ?? '')
    .trim()
    .toLowerCase()
  return ENTITY_TABLE_BY_TYPE[key] ?? null
}

export function asShareEntityNumericIds(v: unknown): number[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
}

export async function copySharedEntitiesToReceiver(
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

export function mapShareRowForClient(
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
