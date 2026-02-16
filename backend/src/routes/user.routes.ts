import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getMe } from '../controllers/user.controller';
import { getMyHistory } from '../controllers/prompt.controller';

export const userRoutes = Router();

userRoutes.get('/me', authenticate, getMe);
userRoutes.get('/me/history', authenticate, getMyHistory);
