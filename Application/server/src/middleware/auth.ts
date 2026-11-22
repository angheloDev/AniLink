import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { HttpError } from '../http';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): string | null {
  try {
    const p = jwt.verify(token, config.JWT_SECRET) as { sub?: string };
    return p.sub ?? null;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization ?? '';
  const id = h.startsWith('Bearer ') ? verifyToken(h.slice(7)) : null;
  if (!id) return next(new HttpError(401, 'Not authenticated'));
  req.userId = id;
  next();
}
