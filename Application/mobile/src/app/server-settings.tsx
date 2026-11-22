import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { applyServerUrl } from '../api/applyServer';
import { getServerUrl, normalizeServerUrl, testConnection } from '../api/server';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { KeyboardScreen } from '../components/KeyboardScreen';
import { ScreenHeader } from '../components/ScreenHeader';
import { Text } from '../components/Text';
import { useToast } from '../components/Toast';

/** Lets the presenter point the app at the PC running the AniLink server (it changes with the Wi-Fi). */
export default function ServerSettings() {
  const { t } = useTranslation();
  const toast = useToast();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getServerUrl().then(setUrl);
  }, []);

  function valid(): string | null {
    try {
      return normalizeServerUrl(url);
    } catch {
      setError(t('server.invalid'));
      return null;
    }
  }

  async function test() {
    setError(null);
    const v = valid();
    if (!v) return;
    setResult('testing');
    setResult((await testConnection(v)) ? 'ok' : 'fail');
  }

  async function save() {
    setError(null);
    const v = valid();
    if (!v) return;
    await applyServerUrl(v);
    toast.show(t('server.saved'), 'success');
    router.back();
  }

  return (
    <KeyboardScreen header={<ScreenHeader title={t('server.title')} />}>
      <View style={{ gap: 14, marginTop: 8 }}>
        <Text variant="body" color="muted">
          {t('server.hint')}
        </Text>
        <Input label={t('server.title')} value={url} onChangeText={(v) => { setUrl(v); setResult('idle'); }} autoCapitalize="none" autoCorrect={false} keyboardType="url" returnKeyType="done" onSubmitEditing={test} error={error} />
        <Button variant="ghost" label={result === 'testing' ? t('server.testing') : t('server.test')} loading={result === 'testing'} onPress={test} />
        {result === 'ok' ? (
          <Text variant="label" color="success">
            ✓ {t('server.ok')}
          </Text>
        ) : null}
        {result === 'fail' ? (
          <Text variant="label" color="danger">
            ✕ {t('server.fail')}
          </Text>
        ) : null}
        <Button label={t('common.save')} onPress={save} />
      </View>
    </KeyboardScreen>
  );
}
