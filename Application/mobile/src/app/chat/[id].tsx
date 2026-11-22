import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Ban, Flag, MoreVertical } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ApiError, uploadImages } from '../../api/client';
import { blockUser, getMessages, markConversationRead, respondOffer, sendMessage, sendOffer, type OfferTermsInput } from '../../api/endpoints';
import { useConversations, useListing, useMessages } from '../../api/hooks';
import type { MessageDTO, OfferDTO } from '../../api/types';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { ChatComposer } from '../../components/ChatComposer';
import { Chip } from '../../components/Chip';
import { IconButton } from '../../components/IconButton';
import { ImageViewer } from '../../components/ImageViewer';
import { ScreenLoader } from '../../components/LogoLoader';
import { ListingChip } from '../../components/ListingChip';
import { MessageBubble } from '../../components/MessageBubble';
import { OfferCard } from '../../components/OfferCard';
import { OfferSheet } from '../../components/OfferSheet';
import { ReportSheet } from '../../components/ReportSheet';
import { Sheet } from '../../components/Sheet';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { TypingDots } from '../../components/TypingDots';
import { addOptimistic, appendOlder, markFailed, resolveSent } from '../../lib/messageList';
import { pickImages } from '../../lib/pickImage';
import { emitSocket, onSocket } from '../../socket';
import { useAuth, useCurrentUser } from '../../store/auth';
import { radii } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

export default function Chat() {
  const { id, offer: openOffer } = useLocalSearchParams<{ id: string; offer?: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const qc = useQueryClient();
  const me = useCurrentUser();

  const convs = useConversations();
  const conv = convs.data?.find((c) => c.id === id);
  const { data: listing } = useListing(conv?.listing?.id);
  const messagesQuery = useMessages(id);
  const messages = messagesQuery.data ?? [];
  const key = ['messages', id];

  const [text, setText] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [offerSheet, setOfferSheet] = useState<{ initial?: OfferTermsInput; counterFor?: OfferDTO } | null>(null);
  const [busyOffer, setBusyOffer] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingSent = useRef(false);
  const offerOpened = useRef(false);
  const noMoreOlder = useRef(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  // Join the realtime room (and re-join after reconnects).
  useEffect(() => {
    if (!id) return;
    emitSocket('conversation:join', id);
    return onSocket('socket:connected', () => emitSocket('conversation:join', id));
  }, [id]);

  // Typing indicator from the other person.
  useEffect(() => {
    let clear: ReturnType<typeof setTimeout> | null = null;
    const off = onSocket('typing', (p: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (p.conversationId !== id || p.userId === me.id) return;
      setOtherTyping(p.isTyping);
      if (clear) clearTimeout(clear);
      if (p.isTyping) clear = setTimeout(() => setOtherTyping(false), 4000);
    });
    return () => {
      off();
      if (clear) clearTimeout(clear);
    };
  }, [id, me.id]);

  // Mark messages read whenever something new from the other person is on screen.
  const newestFromOther = messages.find((m) => m.senderId !== me.id && !m.readAt)?.id;
  useEffect(() => {
    if (!id || !newestFromOther) return;
    void markConversationRead(id)
      .then(() => qc.invalidateQueries({ queryKey: ['conversations'] }))
      .catch(() => undefined);
  }, [id, newestFromOther, qc]);

  // "Make offer" from the listing page opens the offer sheet straight away.
  useEffect(() => {
    if (openOffer === '1' && listing && conv && conv.role === 'buyer' && !offerOpened.current) {
      offerOpened.current = true;
      setOfferSheet({});
    }
  }, [openOffer, listing, conv]);

  const onChangeText = useCallback(
    (v: string) => {
      setText(v);
      if (!id) return;
      if (!typingSent.current && v) {
        typingSent.current = true;
        emitSocket('typing', { conversationId: id, isTyping: true });
      }
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        typingSent.current = false;
        emitSocket('typing', { conversationId: id, isTyping: false });
      }, 2000);
    },
    [id],
  );

  // The server sends the newest 50 messages; fetch earlier ones as the user scrolls up (the list is inverted).
  async function loadOlder() {
    const oldest = messages[messages.length - 1];
    if (!id || loadingOlder || noMoreOlder.current || messages.length < 50 || !oldest || oldest.id.startsWith('tmp-')) return;
    setLoadingOlder(true);
    try {
      const { items } = await getMessages(id, oldest.id);
      if (items.length < 50) noMoreOlder.current = true;
      qc.setQueryData<MessageDTO[]>(key, (old) => appendOlder(old, items));
    } catch {
      /* try again on the next scroll */
    } finally {
      setLoadingOlder(false);
    }
  }

  async function deliver(tmpId: string, payload: { type: 'text' | 'image'; text?: string; imageUrl?: string }) {
    try {
      const { message } = await sendMessage(id!, payload);
      qc.setQueryData<MessageDTO[]>(key, (old) => resolveSent(old, tmpId, message));
      void qc.invalidateQueries({ queryKey: ['conversations'] });
    } catch (e) {
      qc.setQueryData<MessageDTO[]>(key, (old) => markFailed(old, tmpId));
      if (e instanceof ApiError && e.status === 403) toast.show(t('chat.youBlocked'), 'error');
    }
  }

  function send(raw: string) {
    const value = raw.trim();
    if (!value || !id) return;
    const tmpId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    qc.setQueryData<MessageDTO[]>(key, (old) => addOptimistic(old, { tmpId, conversationId: id, senderId: me.id, type: 'text', text: value }));
    void deliver(tmpId, { type: 'text', text: value });
  }

  function retry(m: MessageDTO) {
    qc.setQueryData<MessageDTO[]>(key, (old) => (old ?? []).filter((x) => x.id !== m.id));
    if (m.text) send(m.text);
  }

  async function attach() {
    const [uri] = await pickImages();
    if (!uri || !id) return;
    const tmpId = `tmp-${Date.now()}`;
    qc.setQueryData<MessageDTO[]>(key, (old) => addOptimistic(old, { tmpId, conversationId: id, senderId: me.id, type: 'image', imageUrl: uri }));
    try {
      const [url] = await uploadImages([uri]);
      await deliver(tmpId, { type: 'image', imageUrl: url });
    } catch {
      qc.setQueryData<MessageDTO[]>(key, (old) => markFailed(old, tmpId));
    }
  }

  async function submitOffer(terms: OfferTermsInput) {
    if (!id) return;
    if (offerSheet?.counterFor) {
      const res = await respondOffer(offerSheet.counterFor.id, 'counter', terms);
      void qc.invalidateQueries({ queryKey: key });
      void res;
    } else {
      const res = await sendOffer(id, terms);
      qc.setQueryData<MessageDTO[]>(key, (old) => resolveSent(old, '__none__', res.message));
    }
    void qc.invalidateQueries({ queryKey: ['conversations'] });
    toast.show(t('offer.sent'), 'success');
  }

  async function respond(offer: OfferDTO, action: 'accept' | 'decline') {
    if (busyOffer) return;
    setBusyOffer(offer.id);
    try {
      const res = await respondOffer(offer.id, action);
      qc.setQueryData<MessageDTO[]>(key, (old) => (old ?? []).map((m) => (m.offer?.id === offer.id ? { ...m, offer: res.offer } : m)));
      if (action === 'accept') toast.show(t('offer.orderCreated'), 'success');
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: ['orders'] });
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : t('common.error'), 'error');
      void qc.invalidateQueries({ queryKey: key });
    } finally {
      setBusyOffer(null);
    }
  }

  function confirmBlock() {
    setMenu(false);
    Alert.alert(t('common.block'), t('chat.blockConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.block'),
        style: 'destructive',
        onPress: async () => {
          try {
            await blockUser(conv!.other.id);
            void qc.invalidateQueries({ queryKey: ['listings'] });
            toast.show(t('chat.youBlocked'), 'success');
            router.back();
          } catch {
            toast.show(t('common.error'), 'error');
          }
        },
      },
    ]);
  }

  if (!conv) {
    return convs.isLoading ? (
      <ScreenLoader />
    ) : (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
        <IconButton onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.text} />
        </IconButton>
        <Text variant="body" color="muted" style={{ marginTop: 24 }}>
          {t('listing.notFound')}
        </Text>
      </View>
    );
  }

  const unitOf = conv.listing?.unit ?? 'kg';
  const quick = [t('chat.quick1'), t('chat.quick2'), t('chat.quick3')];
  const canOffer = !!listing && listing.status === 'active';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bg }}>
        <IconButton testID="chat-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/messages'))}>
          <ArrowLeft size={20} color={colors.text} />
        </IconButton>
        <Pressable onPress={() => router.push(`/seller/${conv.other.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <Avatar name={conv.other.name} uri={conv.other.photoUrl} size={40} verified={conv.other.verified} />
          <View style={{ flex: 1 }}>
            <Text variant="subtitle" numberOfLines={1} style={{ fontSize: 15.5 }}>
              {conv.other.name}
            </Text>
            <Text variant="caption" numberOfLines={1}>
              {otherTyping ? t('chat.typing') : conv.listing?.title ?? ''}
            </Text>
          </View>
        </Pressable>
        <IconButton testID="chat-menu" label="Menu" onPress={() => setMenu(true)}>
          <MoreVertical size={20} color={colors.text} />
        </IconButton>
      </View>

      {conv.listing ? <ListingChip listing={conv.listing} /> : null}

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <FlatList
          testID="messages"
          inverted
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12, gap: 8 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          onEndReached={() => void loadOlder()}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingOlder ? <ActivityIndicator color={colors.eyebrow} style={{ padding: 12 }} /> : undefined}
          ListHeaderComponent={otherTyping ? <TypingDots /> : undefined}
          ListEmptyComponent={
            messagesQuery.isLoading ? undefined : (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Text variant="body" color="muted">
                  {t('chat.noMessages')}
                </Text>
              </View>
            )
          }
          renderItem={({ item: m }) => {
            const mine = m.senderId === me.id;
            if (m.type === 'offer' && m.offer) {
              return (
                <OfferCard
                  offer={m.offer}
                  unit={unitOf}
                  mine={m.offer.fromUserId === me.id}
                  otherName={conv.other.name}
                  busy={busyOffer === m.offer.id}
                  onAccept={() => void respond(m.offer!, 'accept')}
                  onDecline={() => void respond(m.offer!, 'decline')}
                  onCounter={() => setOfferSheet({ counterFor: m.offer!, initial: { pricePerUnit: m.offer!.pricePerUnit, quantity: m.offer!.quantity, delivery: m.offer!.delivery, date: m.offer!.date } })}
                />
              );
            }
            if (m.type === 'system') {
              return (
                <View style={{ alignItems: 'center', gap: 8, paddingVertical: 8 }}>
                  <View style={{ backgroundColor: colors.sectionGreen, borderRadius: radii.card, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', gap: 8 }}>
                    <Text variant="label" color="headline">
                      ✅ {t('offer.orderCreated')}
                    </Text>
                    {m.orderId ? <Button testID="view-order" size="sm" label={t('offer.viewOrder')} onPress={() => router.push(`/order/${m.orderId}`)} /> : null}
                  </View>
                </View>
              );
            }
            return <MessageBubble message={m} mine={mine} onPressImage={setViewerUrl} onRetry={() => retry(m)} />;
          }}
        />
        {text.length === 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingBottom: 8 }} style={{ flexGrow: 0 }}>
            {quick.map((q) => (
              <Chip key={q} label={q} onPress={() => send(q)} />
            ))}
          </ScrollView>
        ) : null}
        <ChatComposer
          value={text}
          onChange={onChangeText}
          onSend={() => {
            send(text);
            setText('');
            if (typingTimer.current) clearTimeout(typingTimer.current);
            typingSent.current = false;
            emitSocket('typing', { conversationId: id, isTyping: false });
          }}
          onAttach={() => void attach()}
          onOffer={canOffer ? () => setOfferSheet({}) : undefined}
        />
      </KeyboardAvoidingView>

      {listing ? (
        <OfferSheet
          visible={!!offerSheet}
          onClose={() => setOfferSheet(null)}
          listing={listing}
          initial={offerSheet?.initial}
          title={offerSheet?.counterFor ? t('offer.editCounter') : undefined}
          onSubmit={submitOffer}
        />
      ) : null}
      <ImageViewer visible={!!viewerUrl} photos={viewerUrl ? [viewerUrl] : []} onClose={() => setViewerUrl(null)} />
      <Sheet visible={menu} onClose={() => setMenu(false)}>
        <View style={{ gap: 4 }}>
          <Pressable
            onPress={() => {
              setMenu(false);
              setReportOpen(true);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}
          >
            <Flag size={20} color={colors.text} />
            <Text>{t('common.report')}</Text>
          </Pressable>
          <Pressable testID="block-user" onPress={confirmBlock} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
            <Ban size={20} color={colors.danger} />
            <Text color="danger">{t('common.block')}</Text>
          </Pressable>
        </View>
      </Sheet>
      <ReportSheet visible={reportOpen} onClose={() => setReportOpen(false)} targetType="user" targetId={conv.other.id} />
    </View>
  );
}
