import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '../../store/auth';

export default function OnboardingLayout() {
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  if (!token || !user) return <Redirect href="/(auth)/welcome" />;
  if (user.onboarded) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
