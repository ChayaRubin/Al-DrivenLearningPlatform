import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { signToken } from '../lib/jwt';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name, phone } = req.body;
    const user = await userService.createUser({ email, password, name, phone });
    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({ data: { user, token } });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const user = await userService.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password', code: 'UNAUTHORIZED' });
      return;
    }
    const valid = await userService.verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password', code: 'UNAUTHORIZED' });
      return;
    }
    const token = signToken({ userId: user.id, role: user.role });
    res.json({
      data: {
        user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role, createdAt: user.createdAt },
        token,
      },
    });
  } catch (e) {
    next(e);
  }
}
