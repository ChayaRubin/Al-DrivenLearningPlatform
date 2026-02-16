import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validateCreatePrompt } from '../middlewares/validate.middleware';
import { createPrompt } from '../controllers/prompt.controller';

export const promptRoutes = Router();

promptRoutes.post('/', authenticate, validateCreatePrompt, createPrompt);
