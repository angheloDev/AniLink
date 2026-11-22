import { Redirect } from 'expo-router';
import React from 'react';
import { useAuth } from '../store/auth';

/** Routing gate: signed out -> welcome, signed in but not onboarded -> onboarding, else the app. */
export default function Index() {
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  if (!token || !user) return <Redirect href="/(auth)/welcome" />;
  if (!user.onboarded) return <Redirect href="/(onboarding)/role" />;
  return <Redirect href="/(tabs)/home" />;
}
