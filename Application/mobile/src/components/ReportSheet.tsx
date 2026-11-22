import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { report } from '../api/endpoints';
import { Button } from './Button';
import { Input } from './Input';
import { Sheet } from './Sheet';
import { useToast } from './Toast';

interface Props {
  visible: boolean;
  onClose: () => void;
  targetType: 'user' | 'listing';
  targetId: string;
}

export function ReportSheet({ visible, onClose, targetType, targetId }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await report({ targetType, targetId, reason: reason.trim() });
      toast.show(t('listing.reported'), 'success');
      setReason('');
      onClose();
    } catch {
      toast.show(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title={t('listing.reportTitle')}>
      <View style={{ gap: 14 }}>
        <Input label={t('listing.reportReason')} value={reason} onChangeText={setReason} multiline numberOfLines={3} />
        <Button testID="submit-report" label={t('common.report')} loading={loading} disabled={reason.trim().length < 3} onPress={submit} />
      </View>
    </Sheet>
  );
}
