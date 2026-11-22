import type { Server } from 'socket.io';

let io: Server | null = null;

export function setIo(server: Server | null): void {
  io = server;
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function emitToUsers(userIds: string[], event: string, payload: unknown): void {
  for (const id of new Set(userIds)) emitToUser(id, event, payload);
}
