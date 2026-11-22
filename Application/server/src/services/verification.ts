import { config } from '../config';
import { User } from '../models/User';
import { notify } from './notifications';

export function scheduleVerification(userId: string, delayMs: number = config.VERIFY_DELAY_MS): void {
  const timer = setTimeout(async () => {
    try {
      const res = await User.updateOne({ _id: userId, 'verification.status': 'pending' }, { 'verification.status': 'verified' });
      if (res.modifiedCount) {
        await notify(userId, { type: 'verification', title: 'You are verified', body: 'Your farm is now verified. Buyers will see the badge.', route: '/verification' });
      }
    } catch (e) {
      console.error('verification failed', e);
    }
  }, delayMs);
  timer.unref?.();
}
