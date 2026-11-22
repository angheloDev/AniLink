import type { MessageDTO } from '../src/api/types';
import { addOptimistic, markFailed, resolveSent } from '../src/lib/messageList';

const msg = (id: string, over: Partial<MessageDTO> = {}): MessageDTO => ({
  id,
  conversationId: 'c1',
  senderId: 'me',
  type: 'text',
  text: id,
  imageUrl: null,
  offer: null,
  orderId: null,
  readAt: null,
  createdAt: '2026-11-21T10:00:00.000Z',
  ...over,
});

describe('messageList', () => {
  it('adds an optimistic message at the front (list is newest first) marked pending', () => {
    const out = addOptimistic([msg('a')], { tmpId: 'tmp-1', conversationId: 'c1', senderId: 'me', type: 'text', text: 'hi' });
    expect(out.map((m) => m.id)).toEqual(['tmp-1', 'a']);
    expect(out[0]).toMatchObject({ pending: true, text: 'hi', senderId: 'me' });
  });

  it('replaces the optimistic message with the real one', () => {
    const list = addOptimistic([msg('a')], { tmpId: 'tmp-1', conversationId: 'c1', senderId: 'me', type: 'text', text: 'hi' });
    const out = resolveSent(list, 'tmp-1', msg('real-1', { text: 'hi' }));
    expect(out.map((m) => m.id)).toEqual(['real-1', 'a']);
    expect(out[0].pending).toBeUndefined();
  });

  it('does not duplicate when the real message already arrived over the socket first', () => {
    const list = [msg('tmp-1', { pending: true }), msg('real-1'), msg('a')];
    const out = resolveSent(list, 'tmp-1', msg('real-1'));
    expect(out.map((m) => m.id)).toEqual(['real-1', 'a']);
  });

  it('marks a pending message as failed without removing it', () => {
    const out = markFailed([msg('tmp-1', { pending: true }), msg('a')], 'tmp-1');
    expect(out[0]).toMatchObject({ id: 'tmp-1', failed: true });
    expect(out[0].pending).toBeUndefined();
    expect(out[1].id).toBe('a');
  });

  it('copes with an undefined list', () => {
    expect(resolveSent(undefined, 'tmp-1', msg('r'))).toEqual([msg('r')]);
    expect(markFailed(undefined, 'tmp-1')).toEqual([]);
  });
});
