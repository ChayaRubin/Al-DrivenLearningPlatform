import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError } from '../lib/errors';

export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }
    if (req.user.role !== role) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
}
