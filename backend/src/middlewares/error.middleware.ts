import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }
  const multerCode = (err as Error & { code?: string }).code;
  if (multerCode === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'Image is too large (max 5 MB)', code: 'LIMIT_FILE_SIZE' });
    return;
  }
  if (multerCode === 'LIMIT_UNEXPECTED_FILE' || err.message?.includes('Unexpected field')) {
    res.status(400).json({ error: 'Upload field must be named "image"', code: 'MULTER_ERROR' });
    return;
  }
  if (err.message?.includes('Only image files')) {
    res.status(400).json({ error: err.message, code: 'INVALID_FILE_TYPE' });
    return;
  }
  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
