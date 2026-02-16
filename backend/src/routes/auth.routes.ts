import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middlewares/validate.middleware';

export const authRoutes = Router();

authRoutes.post('/register', validateRegister, register);
authRoutes.post('/login', validateLogin, login);
