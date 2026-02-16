import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import type { JwtPayload } from '../types';

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload as object, config.jwt.secret, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}
