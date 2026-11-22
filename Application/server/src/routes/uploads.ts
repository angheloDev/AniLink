import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { HttpError } from '../http';
import { requireAuth } from '../middleware/auth';

const EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/heic': '.heic',
};

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${EXT[file.mimetype] ?? '.jpg'}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new HttpError(400, 'Only image files are allowed'));
  },
});

export const uploadsRouter = Router();

uploadsRouter.post('/', requireAuth, (req, res, next) => {
  upload.array('files', 5)(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof HttpError) return next(err);
      return next(new HttpError(400, err instanceof Error ? err.message : 'Upload failed'));
    }
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    res.json({ urls: files.map((f) => `/uploads/${f.filename}`) });
  });
});
