import type http from 'node:http';
import { Server } from 'socket.io';
import { verifyToken } from '../middleware/auth';
import { getConversationFor, markRead } from '../services/chat';
import { setIo } from '../services/realtime';

export function attachSockets(httpServer: http.Server): Server {
  const io = new Server(httpServer, { cors: { origin: '*' } });
  setIo(io);

  io.use((socket, next) => {
    const token = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : '';
    const userId = verifyToken(token);
    if (!userId) return next(new Error('unauthorized'));
    socket.data.userId = userId;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    socket.on('conversation:join', async (conversationId: string) => {
      try {
        await getConversationFor(String(conversationId), userId);
        socket.join(`conv:${conversationId}`);
      } catch {
        /* not a participant: ignore */
      }
    });

    socket.on('typing', (p: { conversationId: string; isTyping: boolean }) => {
      if (!socket.rooms.has(`conv:${p?.conversationId}`)) return;
      socket.to(`conv:${p.conversationId}`).emit('typing', { conversationId: p.conversationId, userId, isTyping: !!p.isTyping });
    });

    socket.on('message:read', async (p: { conversationId: string }) => {
      try {
        const conv = await getConversationFor(String(p?.conversationId), userId);
        await markRead(conv, userId);
      } catch {
        /* ignore */
      }
    });
  });

  return io;
}

