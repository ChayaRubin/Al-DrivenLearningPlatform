import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { UnauthorizedError } from '../lib/errors';
import type { AuthUser } from '../types';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or invalid authorization header'));
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId, role: payload.role } as AuthUser;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
