import { io, type Socket } from 'socket.io-client';
import { getServerUrl } from '../api/server';

type Handler = (payload: any) => void;
const listeners = new Map<string, Set<Handler>>();
let socket: Socket | null = null;

/** Subscribe to a server event. Survives reconnects; returns an unsubscribe function. */
export function onSocket(event: string, handler: Handler): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(handler);
  return () => {
    listeners.get(event)?.delete(handler);
  };
}

export function dispatchSocketEvent(event: string, payload?: unknown): void {
  listeners.get(event)?.forEach((h) => {
    try {
      h(payload);
    } catch (e) {
      console.warn('socket handler failed', event, e);
    }
  });
}

export async function connectSocket(token: string): Promise<void> {
  disconnectSocket();
  const url = await getServerUrl();
  socket = io(url, { auth: { token }, transports: ['websocket'], reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 5000 });
  socket.onAny((event, payload) => dispatchSocketEvent(event, payload));
  socket.on('connect', () => dispatchSocketEvent('socket:connected'));
  socket.on('disconnect', () => dispatchSocketEvent('socket:disconnected'));
}

export function disconnectSocket(): void {
  socket?.removeAllListeners();
  socket?.close();
  socket = null;
}

export function emitSocket(event: string, payload?: unknown): void {
  socket?.emit(event, payload);
}

export function isSocketConnected(): boolean {
  return !!socket?.connected;
}
