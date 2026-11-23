import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { openConversation } from '../api/endpoints';
import type { ConversationDTO } from '../api/types';
import { useToast } from '../components/Toast';

/** Opens (or reuses) the conversation about a listing and navigates to it. */
export function useStartChat() {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  async function start(listingId: string, opts: { offer?: boolean } = {}) {
    if (loading) return;
    setLoading(true);
    try {
      const { conversation } = await openConversation(listingId);
      // The chat screen finds its conversation in the cached list. That list predates a brand-new
      // conversation, so add it before navigating (otherwise the screen briefly reports "not found").
      // An empty cache is left alone: the chat screen then shows its loader while the list loads.
      qc.setQueryData<ConversationDTO[]>(['conversations'], (old) => {
        if (!old) return old;
        return old.some((c) => c.id === conversation.id) ? old.map((c) => (c.id === conversation.id ? conversation : c)) : [conversation, ...old];
      });
      void qc.invalidateQueries({ queryKey: ['conversations'] });
      router.push({ pathname: '/chat/[id]', params: { id: conversation.id, ...(opts.offer ? { offer: '1' } : {}) } });
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : t('auth.errNetwork'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return { start, loading };
}
