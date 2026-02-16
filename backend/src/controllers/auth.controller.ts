import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { signToken } from '../lib/jwt';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, phone } = req.body;
    const user = await userService.createUser({ name, phone });
    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({ data: { user, token } });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, phone } = req.body;
    const user = await userService.findByNameAndPhone(name, phone);
    if (!user) {
      res.status(401).json({ error: 'Invalid name or phone', code: 'UNAUTHORIZED' });
      return;
    }
    const token = signToken({ userId: user.id, role: user.role });
    res.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (e) {
    next(e);
  }
}
