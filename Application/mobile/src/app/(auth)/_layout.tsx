import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '../../store/auth';

export default function AuthLayout() {
  const token = useAuth((s) => s.token);
  if (token) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
