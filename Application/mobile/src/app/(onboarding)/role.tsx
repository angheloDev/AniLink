import { router } from 'expo-router';
import { Bell, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { patchMe } from '../../api/endpoints';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LanguageToggle } from '../../components/LanguageToggle';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { ensurePermission } from '../../lib/notifications';
import { useAuth } from '../../store/auth';
import { radii } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import type { Role } from '../../api/types';

export default function RoleScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const [role, setRole] = useState<Role>(user?.role ?? 'buyer');
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState(false);

  async function next() {
    setLoading(true);
    try {
      const { user: u } = await patchMe({ role });
      useAuth.getState().setUser(u);
      router.push('/(onboarding)/profile');
    } catch {
      toast.show(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  const options: { id: Role; emoji: string; title: string; desc: string }[] = [
    { id: 'farmer', emoji: '🧑‍🌾', title: t('onboarding.farmer'), desc: t('onboarding.farmerDesc') },
    { id: 'buyer', emoji: '🛒', title: t('onboarding.buyer'), desc: t('onboarding.buyerDesc') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 18 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'flex-start' }}>
          <LanguageToggle />
        </View>
        <View style={{ gap: 6 }}>
          <Text variant="eyebrow">1 / {role === 'farmer' ? 3 : 2}</Text>
          <Text variant="display">{t('onboarding.roleTitle')}</Text>
          <Text color="muted">{t('onboarding.roleSub')}</Text>
        </View>
        {options.map((o) => {
          const active = role === o.id;
          return (
            <Pressable key={o.id} testID={`role-${o.id}`} onPress={() => setRole(o.id)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  padding: 18,
                  borderRadius: radii.card,
                  borderWidth: 2,
                  borderColor: active ? colors.eyebrow : colors.border,
                  backgroundColor: active ? colors.sectionGreen : colors.surface,
                }}
              >
                <Text style={{ fontSize: 40, lineHeight: 52 }}>{o.emoji}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="subtitle">{o.title}</Text>
                  <Text variant="caption">{o.desc}</Text>
                </View>
                <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: active ? colors.eyebrow : colors.border, backgroundColor: active ? colors.eyebrow : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {active ? <Check size={16} color="#1F1E1B" /> : null}
                </View>
              </View>
            </Pressable>
          );
        })}
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.sectionGreen, alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={22} color={colors.eyebrow} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="label">{t('onboarding.notifTitle')}</Text>
            <Text variant="caption">{t('onboarding.notifSub')}</Text>
          </View>
          <Button
            size="sm"
            variant={allowed ? 'ghost' : 'primary'}
            label={allowed ? '✓' : t('onboarding.notifAllow')}
            onPress={async () => setAllowed(await ensurePermission())}
            style={{ paddingHorizontal: 14 }}
          />
        </Card>
      </ScrollView>
      <View style={{ padding: 20, paddingBottom: insets.bottom + 16 }}>
        <Button testID="role-continue" label={t('common.continue')} loading={loading} onPress={next} />
      </View>
    </View>
  );
}
