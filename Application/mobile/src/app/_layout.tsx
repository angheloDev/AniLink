import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient, useOrderReminderSync, useRealtimeSync } from '../api/hooks';
import { AnimatedSplash } from '../components/AnimatedSplash';
import { OfflineBanner } from '../components/OfflineBanner';
import { ToastProvider } from '../components/Toast';
import { loadLanguage } from '../i18n';
import { markNavReady } from '../lib/navReady';
import { useNotificationBridge } from '../lib/useNotificationBridge';
import { useAuth } from '../store/auth';
import { ThemeProvider } from '../theme/ThemeProvider';
import { useTheme } from '../theme/useTheme';

void SplashScreen.preventAutoHideAsync();

const MIN_SPLASH_MS = 1300;
const MAX_WAIT_MS = 6500;

function Boot({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { colors, resolved, ready: themeReady } = useTheme();
  const authReady = useAuth((s) => s.ready);
  const [langReady, setLangReady] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [splashGone, setSplashGone] = useState(false);

  useRealtimeSync();
  useOrderReminderSync();
  useNotificationBridge();

  useEffect(() => {
    void loadLanguage().finally(() => setLangReady(true));
    void useAuth
      .getState()
      .load()
      .then(() => useAuth.getState().refreshMe())
      .finally(() => setDataReady(true));
    const min = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    const cap = setTimeout(() => setDataReady(true), MAX_WAIT_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(cap);
    };
  }, []);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.bg);
  }, [colors.bg]);

  // When the session ends (signed out, or the server rejected the token) leave any signed-in screen and drop cached data.
  const token = useAuth((s) => s.token);
  const hadToken = useRef(false);
  useEffect(() => {
    if (token) {
      hadToken.current = true;
    } else if (hadToken.current) {
      hadToken.current = false;
      queryClient.clear();
      router.replace('/(auth)/welcome');
    }
  }, [token]);

  const shellReady = fontsLoaded && themeReady;
  useEffect(() => {
    if (shellReady) SplashScreen.hide();
  }, [shellReady]);

  useEffect(() => {
    if (shellReady && authReady) markNavReady();
  }, [shellReady, authReady]);

  const allReady = shellReady && langReady && dataReady && minElapsed && authReady;
  const onSplashDone = useCallback(() => setSplashGone(true), []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      {shellReady && authReady ? (
        <>
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.bg } }} />
        </>
      ) : null}
      {shellReady && !splashGone ? <AnimatedSplash done={allReady} onDone={onSplashDone} /> : null}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <ToastProvider>
                <Boot fontsLoaded={fontsLoaded} />
              </ToastProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
