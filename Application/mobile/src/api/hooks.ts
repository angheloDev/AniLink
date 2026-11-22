import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { cancelReminder, scheduleHarvestReminder, syncOrderReminders } from '../lib/reminders';
import { onSocket } from '../socket';
import { useAuth } from '../store/auth';
import * as ep from './endpoints';
import type { ListingFilters, MessageDTO, OfferDTO } from './types';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000, refetchOnReconnect: true } },
});

const enabled = () => !!useAuth.getState().token;

export const useListings = (filters: ListingFilters = {}, opts: { enabled?: boolean } = {}) =>
  useQuery({ queryKey: ['listings', filters], queryFn: async () => (await ep.getListings(filters)).items, enabled: opts.enabled ?? true });

export const useListing = (id: string | undefined) =>
  useQuery({ queryKey: ['listing', id], queryFn: async () => (await ep.getListing(id!)).listing, enabled: !!id });

export const useDashboard = () => useQuery({ queryKey: ['dashboard'], queryFn: ep.getDashboard, refetchInterval: 20_000 });

export const useFavorites = () => useQuery({ queryKey: ['favorites'], queryFn: async () => (await ep.getFavorites()).items });

export const useConversations = () => useQuery({ queryKey: ['conversations'], queryFn: async () => (await ep.getConversations()).items, refetchInterval: 20_000 });

export const useMessages = (conversationId: string | undefined) =>
  useQuery({ queryKey: ['messages', conversationId], queryFn: async () => (await ep.getMessages(conversationId!)).items, enabled: !!conversationId });

export const useOrders = (role: 'buying' | 'selling', opts: { enabled?: boolean } = {}) =>
  useQuery({ queryKey: ['orders', role], queryFn: async () => (await ep.getOrders(role)).items, enabled: opts.enabled ?? true });

export const useOrder = (id: string | undefined) => useQuery({ queryKey: ['order', id], queryFn: async () => (await ep.getOrder(id!)).order, enabled: !!id });

export const useNotifications = () => useQuery({ queryKey: ['notifications'], queryFn: async () => (await ep.getNotifications()).items });

export const useUnreadCount = () => useQuery({ queryKey: ['unread'], queryFn: async () => (await ep.getUnreadCount()).count, refetchInterval: 30_000 });

export const usePriceGuide = () => useQuery({ queryKey: ['priceGuide'], queryFn: async () => (await ep.getPriceGuide()).items, staleTime: 5 * 60_000 });

export const useAlerts = () => useQuery({ queryKey: ['alerts'], queryFn: async () => (await ep.getAlerts()).items });

export const useProfile = (id: string | undefined) => useQuery({ queryKey: ['profile', id], queryFn: () => ep.getProfile(id!), enabled: !!id });

/** Optimistically flips a listing's heart everywhere it is cached, then confirms with the server. */
export function useToggleFavorite() {
  const qc = useQueryClient();
  return async (listing: { id: string; favorited: boolean; title?: string; preorder?: boolean; harvestDate?: string | null }) => {
    const next = !listing.favorited;
    const patch = (l: { id: string; favorited: boolean; favoritesCount?: number }) => (l.id === listing.id ? { ...l, favorited: next } : l);
    qc.setQueriesData({ queryKey: ['listings'] }, (old: unknown) => (Array.isArray(old) ? old.map(patch) : old));
    qc.setQueryData(['listing', listing.id], (old: unknown) => (old ? patch(old as { id: string; favorited: boolean }) : old));
    try {
      await ep.toggleFavorite(listing.id);
      qc.invalidateQueries({ queryKey: ['favorites'] });
      // Saving an upcoming harvest sets a reminder for harvest day (and removing it cancels the reminder).
      if (!next) void cancelReminder(`harvest:${listing.id}`);
      else if (listing.preorder && listing.harvestDate && listing.title) void scheduleHarvestReminder({ id: listing.id, title: listing.title, harvestDate: listing.harvestDate });
    } catch {
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['listing', listing.id] });
    }
  };
}

/** Mount once under the QueryClientProvider: keeps cached data fresh from realtime server events. */
export function useRealtimeSync() {
  const qc = useQueryClient();
  const token = useAuth((s) => s.token);
  useEffect(() => {
    if (!token) return;
    const offs = [
      onSocket('message:new', ({ message }: { message: MessageDTO }) => {
        qc.setQueryData<MessageDTO[]>(['messages', message.conversationId], (old) => (old && !old.some((m) => m.id === message.id) ? [message, ...old] : old));
        qc.invalidateQueries({ queryKey: ['conversations'] });
      }),
      onSocket('message:read', ({ conversationId }: { conversationId: string }) => {
        qc.invalidateQueries({ queryKey: ['messages', conversationId] });
        qc.invalidateQueries({ queryKey: ['conversations'] });
      }),
      onSocket('offer:update', ({ offer }: { offer: OfferDTO }) => {
        qc.setQueryData<MessageDTO[]>(['messages', offer.conversationId], (old) => old?.map((m) => (m.offer?.id === offer.id ? { ...m, offer } : m)));
        qc.invalidateQueries({ queryKey: ['orders'] });
        qc.invalidateQueries({ queryKey: ['dashboard'] });
      }),
      onSocket('order:update', ({ order }: { order: { id: string } }) => {
        qc.invalidateQueries({ queryKey: ['orders'] });
        qc.invalidateQueries({ queryKey: ['order', order.id] });
        qc.invalidateQueries({ queryKey: ['listings'] });
        qc.invalidateQueries({ queryKey: ['dashboard'] });
      }),
      onSocket('notification:new', () => {
        qc.invalidateQueries({ queryKey: ['dashboard'] });
        qc.invalidateQueries({ queryKey: ['notifications'] });
        qc.invalidateQueries({ queryKey: ['unread'] });
      }),
      onSocket('socket:connected', () => qc.invalidateQueries()),
    ];
    return () => offs.forEach((off) => off());
  }, [qc, token]);
}

export { enabled as hasSession };

/** Mount once: keeps pickup/delivery reminders in step with the user's open orders. */
export function useOrderReminderSync() {
  const token = useAuth((s) => s.token);
  const buying = useOrders('buying', { enabled: !!token });
  const selling = useOrders('selling', { enabled: !!token });
  useEffect(() => {
    if (!token) return;
    const mine = [...(buying.data ?? []).filter((o) => o.buyer.id === useAuth.getState().user?.id), ...(selling.data ?? [])];
    if (mine.length) void syncOrderReminders(mine);
  }, [token, buying.data, selling.data]);
}
