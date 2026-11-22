import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { openConversation } from '../api/endpoints';
import { useToast } from '../components/Toast';

/** Opens (or reuses) the conversation about a listing and navigates to it. */
export function useStartChat() {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function start(listingId: string, opts: { offer?: boolean } = {}) {
    if (loading) return;
    setLoading(true);
    try {
      const { conversation } = await openConversation(listingId);
      router.push({ pathname: '/chat/[id]', params: { id: conversation.id, ...(opts.offer ? { offer: '1' } : {}) } });
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : t('auth.errNetwork'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return { start, loading };
}
