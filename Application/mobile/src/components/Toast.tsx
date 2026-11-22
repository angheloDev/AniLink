import { CircleCheck, CircleAlert, Info } from 'lucide-react-native';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

type Kind = 'info' | 'success' | 'error';
interface ToastApi {
  show: (message: string, kind?: Kind) => void;
}
const ToastContext = createContext<ToastApi>({ show: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ id: number; message: string; kind: Kind } | null>(null);
  const y = useRef(new Animated.Value(-120)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, kind: Kind = 'info') => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ id: Date.now(), message, kind });
      Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
      timer.current = setTimeout(() => {
        Animated.timing(y, { toValue: -120, duration: 220, useNativeDriver: true }).start(() => setToast(null));
      }, 3000);
    },
    [y],
  );
  const api = useMemo(() => ({ show }), [show]);
  const tone = toast?.kind === 'error' ? colors.danger : toast?.kind === 'success' ? colors.success : colors.eyebrow;
  const Icon = toast?.kind === 'error' ? CircleAlert : toast?.kind === 'success' ? CircleCheck : Info;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, transform: [{ translateY: y }], zIndex: 999 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderColor: tone, borderWidth: 1, borderRadius: radii.input, padding: 14, elevation: 6 }}
          >
            <Icon size={20} color={tone} />
            <Text variant="label" style={{ flex: 1 }}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}
