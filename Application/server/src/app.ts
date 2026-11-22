import path from 'node:path';
import cors from 'cors';
import express, { type Express } from 'express';
import { errorHandler } from './http';
import { authRouter } from './routes/auth';
import { conversationsRouter, offersRouter } from './routes/conversations';
import { alertsRouter, notificationsRouter, reportsRouter } from './routes/engagement';
import { listingsRouter } from './routes/listings';
import { meRouter } from './routes/me';
import { ordersRouter } from './routes/orders';
import { priceGuideRouter } from './routes/priceGuide';
import { uploadsRouter } from './routes/uploads';
import { usersRouter } from './routes/users';

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/me', meRouter);
  app.use('/api/listings', listingsRouter);
  app.use('/api/price-guide', priceGuideRouter);
  app.use('/api/uploads', uploadsRouter);
  app.use('/api/conversations', conversationsRouter);
  app.use('/api/offers', offersRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/alerts', alertsRouter);
  app.use('/api/reports', reportsRouter);

  app.use(errorHandler);
  return app;
}
