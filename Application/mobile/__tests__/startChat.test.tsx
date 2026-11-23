import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';
import { openConversation } from '../src/api/endpoints';
import type { ConversationDTO } from '../src/api/types';
import { useStartChat } from '../src/lib/useStartChat';

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../src/api/endpoints', () => ({ openConversation: jest.fn() }));

const conv = (id: string, extra: Partial<ConversationDTO> = {}): ConversationDTO => ({
  id,
  listing: { id: `l-${id}`, title: 'Tomatoes', photo: null, price: 40, unit: 'kg', category: 'vegetables' },
  other: { id: 'seller1', name: 'Mang Jose', photoUrl: null, verified: true },
  role: 'buyer',
  lastMessage: '',
  lastAt: '2026-11-23T01:00:00.000Z',
  unread: 0,
  ...extra,
});

function setup(cached?: ConversationDTO[]) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 15_000 } } });
  if (cached) qc.setQueryData(['conversations'], cached);
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

const cachedAtNavigation = (qc: QueryClient) => {
  let seen: ConversationDTO[] | undefined;
  (router.push as jest.Mock).mockImplementation(() => {
    seen = qc.getQueryData<ConversationDTO[]>(['conversations']);
  });
  return () => seen;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useStartChat (Message / Make offer from a listing)', () => {
  it('puts the new conversation in the conversations cache before navigating, so the chat screen can find it', async () => {
    const { qc, wrapper } = setup([conv('old')]);
    const seen = cachedAtNavigation(qc);
    (openConversation as jest.Mock).mockResolvedValue({ conversation: conv('new') });
    const { result } = await renderHook(() => useStartChat(), { wrapper });

    await act(async () => {
      await result.current.start('l-new');
    });

    expect(router.push).toHaveBeenCalledWith({ pathname: '/chat/[id]', params: { id: 'new' } });
    expect(seen()?.map((c) => c.id)).toEqual(['new', 'old']);
  });

  it('does not duplicate a conversation that is already cached (re-opening the same listing)', async () => {
    const { qc, wrapper } = setup([conv('a'), conv('b', { lastMessage: 'stale' })]);
    const seen = cachedAtNavigation(qc);
    (openConversation as jest.Mock).mockResolvedValue({ conversation: conv('b', { lastMessage: 'fresh' }) });
    const { result } = await renderHook(() => useStartChat(), { wrapper });

    await act(async () => {
      await result.current.start('l-b', { offer: true });
    });

    expect(router.push).toHaveBeenCalledWith({ pathname: '/chat/[id]', params: { id: 'b', offer: '1' } });
    expect(seen()?.map((c) => c.id)).toEqual(['a', 'b']);
    expect(seen()?.find((c) => c.id === 'b')?.lastMessage).toBe('fresh');
  });

  it('leaves an empty cache empty, so the Messages tab never shows a one-item list as if it were complete', async () => {
    const { qc, wrapper } = setup();
    const seen = cachedAtNavigation(qc);
    (openConversation as jest.Mock).mockResolvedValue({ conversation: conv('new') });
    const { result } = await renderHook(() => useStartChat(), { wrapper });

    await act(async () => {
      await result.current.start('l-new');
    });

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(seen()).toBeUndefined();
  });

  it('marks the list stale so it refetches in the background', async () => {
    const { qc, wrapper } = setup([conv('old')]);
    (openConversation as jest.Mock).mockResolvedValue({ conversation: conv('new') });
    const { result } = await renderHook(() => useStartChat(), { wrapper });

    await act(async () => {
      await result.current.start('l-new');
    });

    expect(qc.getQueryState(['conversations'])?.isInvalidated).toBe(true);
  });
});
