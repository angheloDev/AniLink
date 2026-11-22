import { Calendar, Truck, Store } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OfferDTO, Unit } from '../api/types';
import { formatDate, formatPeso } from '../lib/format';
import { offerTotal } from '../lib/validateOffer';
import { fonts, radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Button } from './Button';
import { Text } from './Text';

interface Props {
  offer: OfferDTO;
  unit: Unit;
  /** The offer was sent by the viewer. */
  mine: boolean;
  otherName: string;
  busy?: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onCounter: () => void;
}

export function OfferCard({ offer: o, unit, mine, otherName, busy, onAccept, onDecline, onCounter }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const canRespond = o.status === 'pending' && !mine;
  const dim = o.status === 'superseded' || o.status === 'countered';
  const tone = o.status === 'accepted' ? colors.success : o.status === 'declined' ? colors.danger : o.status === 'pending' ? colors.sun : colors.muted;
  const unitLabel = t(`units.${unit}`);

  return (
    <View
      testID={`offer-card-${o.id}`}
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        width: '88%',
        borderRadius: radii.card,
        borderWidth: 1.5,
        borderColor: o.status === 'pending' ? colors.sun : colors.border,
        backgroundColor: colors.surface,
        padding: 14,
        gap: 10,
        opacity: dim ? 0.55 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="eyebrow">{mine ? t('offer.youOffered') : t('offer.theyOffered', { name: otherName })}</Text>
        <View style={{ backgroundColor: tone, borderRadius: 999, paddingHorizontal: 10, height: 22, justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 10.5, color: '#1F1E1B' }}>{t(`offer.status.${o.status}`)}</Text>
        </View>
      </View>
      <View>
        <Text>
          <Text variant="price" style={{ fontSize: 24 }}>
            {formatPeso(o.pricePerUnit)}
          </Text>
          <Text variant="caption"> /{unitLabel} × {o.quantity} {unitLabel}</Text>
        </Text>
        <Text variant="label" color="headline">
          {t('offer.total')}: {formatPeso(offerTotal(o.pricePerUnit, o.quantity))}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {o.delivery === 'delivery' ? <Truck size={15} color={colors.muted} /> : <Store size={15} color={colors.muted} />}
          <Text variant="caption">{o.delivery === 'delivery' ? t('listing.delivery') : t('listing.pickup')}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Calendar size={15} color={colors.muted} />
          <Text variant="caption">{formatDate(o.date)}</Text>
        </View>
      </View>
      {canRespond ? (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button testID={`accept-${o.id}`} size="sm" label={t('offer.accept')} loading={busy} onPress={onAccept} style={{ flex: 1 }} />
            <Button testID={`counter-${o.id}`} size="sm" variant="accent" label={t('offer.counter')} disabled={busy} onPress={onCounter} style={{ flex: 1 }} />
          </View>
          <Button testID={`decline-${o.id}`} size="sm" variant="danger" label={t('offer.decline')} disabled={busy} onPress={onDecline} />
        </View>
      ) : null}
    </View>
  );
}
