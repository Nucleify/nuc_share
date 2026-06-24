export type ShareEntityAcceptedPayload = {
  entityType: string
}

type Listener = (p: ShareEntityAcceptedPayload) => void | Promise<void>

const listeners = new Set<Listener>()

export function onShareEntityAccepted(cb: Listener): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function notifyShareEntityAccepted(entityType: string): void {
  const et = String(entityType ?? '')
    .trim()
    .toLowerCase()
  if (!et) return
  const payload: ShareEntityAcceptedPayload = { entityType: et }
  for (const l of listeners) {
    try {
      void Promise.resolve(l(payload)).catch(() => undefined)
    } catch {
      // ignore listener errors
    }
  }
}
