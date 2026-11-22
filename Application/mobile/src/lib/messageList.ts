import type { MessageDTO } from '../api/types';

/** Message lists are newest first (the chat list is inverted). */
export function addOptimistic(
  list: MessageDTO[] | undefined,
  m: { tmpId: string; conversationId: string; senderId: string; type: 'text' | 'image'; text?: string; imageUrl?: string },
): MessageDTO[] {
  const optimistic: MessageDTO = {
    id: m.tmpId,
    conversationId: m.conversationId,
    senderId: m.senderId,
    type: m.type,
    text: m.text ?? null,
    imageUrl: m.imageUrl ?? null,
    offer: null,
    orderId: null,
    readAt: null,
    createdAt: new Date().toISOString(),
    pending: true,
  };
  return [optimistic, ...(list ?? [])];
}

/** Swap the optimistic message for the server's. If the socket already delivered it, just drop the temp one. */
export function resolveSent(list: MessageDTO[] | undefined, tmpId: string, real: MessageDTO): MessageDTO[] {
  const rest = (list ?? []).filter((x) => x.id !== tmpId);
  if (rest.some((x) => x.id === real.id)) return rest;
  const idx = (list ?? []).findIndex((x) => x.id === tmpId);
  if (idx === -1) return [real, ...rest];
  const out = [...rest];
  out.splice(Math.min(idx, out.length), 0, real);
  return out;
}

export function markFailed(list: MessageDTO[] | undefined, tmpId: string): MessageDTO[] {
  return (list ?? []).map((m) => {
    if (m.id !== tmpId) return m;
    const { pending: _p, ...rest } = m;
    return { ...rest, failed: true };
  });
}

/** Older messages (also newest first) go after the ones already shown; duplicates are dropped. */
export function appendOlder(list: MessageDTO[] | undefined, older: MessageDTO[]): MessageDTO[] {
  const have = new Set((list ?? []).map((m) => m.id));
  return [...(list ?? []), ...older.filter((m) => !have.has(m.id))];
}
