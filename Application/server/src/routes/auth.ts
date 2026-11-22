import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { HttpError, asyncHandler } from '../http';
import { signToken } from '../middleware/auth';
import { User, toUserDTO } from '../models/User';
import { consumeCode, issueCode } from '../services/codes';

export const authRouter = Router();
const email = z.string().trim().toLowerCase().email();

function session(user: Parameters<typeof toUserDTO>[0]) {
  return { token: signToken(String(user._id)), user: toUserDTO(user) };
}

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const b = z
      .object({ name: z.string().trim().min(1), email, password: z.string().min(6), role: z.enum(['farmer', 'buyer']) })
      .parse(req.body);
    if (await User.findOne({ email: b.email })) throw new HttpError(409, 'Email already registered');
    const user = await User.create({ name: b.name, email: b.email, role: b.role, passwordHash: await bcrypt.hash(b.password, 8) });
    res.status(201).json(session(user));
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const b = z.object({ email, password: z.string() }).parse(req.body);
    const user = await User.findOne({ email: b.email });
    if (!user?.passwordHash || !(await bcrypt.compare(b.password, user.passwordHash))) throw new HttpError(401, 'Wrong email or password');
    res.json(session(user));
  }),
);

authRouter.post(
  '/google-demo',
  asyncHandler(async (req, res) => {
    const b = z.object({ email, name: z.string().trim().min(1), photoUrl: z.string().optional() }).parse(req.body);
    let user = await User.findOne({ email: b.email });
    if (!user) user = await User.create({ email: b.email, name: b.name, photoUrl: b.photoUrl, role: 'buyer', onboarded: false });
    res.json(session(user));
  }),
);

authRouter.post(
  '/otp/request',
  asyncHandler(async (req, res) => {
    const b = z.object({ phone: z.string().min(7) }).parse(req.body);
    res.json({ code: issueCode(`otp:${b.phone}`) });
  }),
);

authRouter.post(
  '/otp/verify',
  asyncHandler(async (req, res) => {
    const b = z.object({ phone: z.string(), code: z.string() }).parse(req.body);
    if (!consumeCode(`otp:${b.phone}`, b.code)) throw new HttpError(400, 'Invalid or expired code');
    res.json({ ok: true });
  }),
);

authRouter.post(
  '/forgot',
  asyncHandler(async (req, res) => {
    const b = z.object({ email }).parse(req.body);
    if (!(await User.findOne({ email: b.email }))) throw new HttpError(404, 'No account with that email');
    res.json({ code: issueCode(`reset:${b.email}`) });
  }),
);

authRouter.post(
  '/reset',
  asyncHandler(async (req, res) => {
    const b = z.object({ email, code: z.string(), password: z.string().min(6) }).parse(req.body);
    if (!consumeCode(`reset:${b.email}`, b.code)) throw new HttpError(400, 'Invalid or expired code');
    await User.updateOne({ email: b.email }, { passwordHash: await bcrypt.hash(b.password, 8) });
    res.json({ ok: true });
  }),
);
