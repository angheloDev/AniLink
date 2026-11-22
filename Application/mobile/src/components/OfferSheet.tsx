import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DeliveryMethod, ListingDTO } from '../api/types';
import type { OfferTermsInput } from '../api/endpoints';
import { addDays, todayIso } from '../lib/dates';
import { formatPeso } from '../lib/format';
import { offerTotal, validateOffer } from '../lib/validateOffer';
import { Button } from './Button';
import { Chip } from './Chip';
import { DateField } from './DateField';
import { Input, type InputRef } from './Input';
import { Sheet } from './Sheet';
import { Text } from './Text';

interface Props {
  visible: boolean;
  onClose: () => void;
  listing: Pick<ListingDTO, 'price' | 'unit' | 'stock' | 'minOrder' | 'negotiable' | 'pickup' | 'delivery'>;
  initial?: OfferTermsInput;
  title?: string;
  onSubmit: (terms: OfferTermsInput) => Promise<void>;
}

const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(/,/g, '')));

export function OfferSheet({ visible, onClose, listing, initial, title, onSubmit }: Props) {
  const { t } = useTranslation();
  const defaultMethod: DeliveryMethod = initial?.delivery ?? (listing.pickup ? 'pickup' : 'delivery');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [method, setMethod] = useState<DeliveryMethod>(defaultMethod);
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const qtyRef = useRef<InputRef>(null);

  useEffect(() => {
    if (!visible) return;
    setPrice(String(initial?.pricePerUnit ?? listing.price));
    setQty(String(initial?.quantity ?? Math.max(listing.minOrder, 1)));
    setMethod(defaultMethod);
    setDate(initial?.date ?? addDays(todayIso(), 1));
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const p = num(price);
  const q = num(qty);
  const total = p > 0 && q > 0 ? offerTotal(p, q) : null;

  async function submit() {
    const problem = validateOffer({ pricePerUnit: p, quantity: q }, listing);
    if (problem) return setError(t(problem.key, { n: problem.n }));
    if (!date) return setError(t('sell.errHarvest'));
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ pricePerUnit: p, quantity: q, delivery: method, date });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title={title ?? t('offer.title')}>
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Input
            containerStyle={{ flex: 1 }}
            label={t('offer.pricePerUnit', { unit: t(`units.${listing.unit}`) })}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            returnKeyType="next"
            blurOnSubmit={false}
            editable={listing.negotiable}
            onSubmitEditing={() => qtyRef.current?.focus()}
          />
          <Input ref={qtyRef} containerStyle={{ flex: 1 }} label={`${t('offer.quantity')} (${t(`units.${listing.unit}`)})`} value={qty} onChangeText={setQty} keyboardType="decimal-pad" returnKeyType="done" />
        </View>
        <Text variant="caption" color="muted">
          {t(listing.negotiable ? 'offer.negotiableNote' : 'offer.fixedNote', { price: formatPeso(listing.price), unit: t(`units.${listing.unit}`) })}
        </Text>
        <View style={{ gap: 8 }}>
          <Text variant="label" color="muted">
            {t('offer.delivery')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {listing.pickup ? <Chip label={t('listing.pickup')} selected={method === 'pickup'} onPress={() => setMethod('pickup')} /> : null}
            {listing.delivery ? <Chip label={t('listing.delivery')} selected={method === 'delivery'} onPress={() => setMethod('delivery')} /> : null}
          </View>
        </View>
        <DateField label={t('offer.date')} value={date} onChange={setDate} offsets={[1, 2, 3, 7]} />
        {total != null ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text color="muted">{t('offer.total')}</Text>
            <Text variant="price">{formatPeso(total)}</Text>
          </View>
        ) : null}
        {error ? (
          <Text variant="label" color="danger">
            {error}
          </Text>
        ) : null}
        <Button testID="send-offer" label={t('offer.send')} loading={loading} onPress={submit} />
      </View>
    </Sheet>
  );
}
