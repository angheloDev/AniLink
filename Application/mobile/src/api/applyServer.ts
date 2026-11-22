import { connectSocket } from '../socket';
import { useAuth } from '../store/auth';
import { queryClient } from './hooks';
import { setServerUrl } from './server';

/**
 * Saves a new server address and re-checks reachability against it: the offline banner stays up
 * if the new address does not answer, and only clears once it does.
 */
export async function applyServerUrl(raw: string): Promise<string> {
  const url = await setServerUrl(raw);
  const { token } = useAuth.getState();
  if (token) {
    void connectSocket(token);
    await useAuth.getState().refreshMe();
  }
  await queryClient.invalidateQueries();
  return url;
}
