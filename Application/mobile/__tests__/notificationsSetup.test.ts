import { Platform } from 'react-native';

const mockSetChannel = jest.fn();

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: (...args: unknown[]) => mockSetChannel(...args),
  AndroidImportance: { HIGH: 4 },
}));

import { setupNotifications } from '../src/lib/notifications';

describe('setupNotifications', () => {
  beforeEach(() => {
    mockSetChannel.mockReset();
    jest.replaceProperty(Platform, 'OS', 'android');
  });
  afterEach(() => jest.restoreAllMocks());

  it('does not reject when the runtime (e.g. Expo Go) refuses to create the channel', async () => {
    mockSetChannel.mockRejectedValue(new Error('NullPointerException'));
    await expect(setupNotifications('AniLink')).resolves.toBeUndefined();
  });

  it('retries with a minimal channel config when the full one is refused', async () => {
    mockSetChannel.mockRejectedValueOnce(new Error('NPE')).mockResolvedValue(undefined);
    await setupNotifications('AniLink');
    expect(mockSetChannel).toHaveBeenCalledTimes(2);
    expect(mockSetChannel.mock.calls[1][1]).toEqual({ name: 'AniLink', importance: 4 });
  });
});
