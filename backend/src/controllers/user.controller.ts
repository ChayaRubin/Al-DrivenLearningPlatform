import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }
    const user = await userService.getUserOrThrow(req.user.id);
    res.json({ data: user });
  } catch (e) {
    next(e);
  }
}
