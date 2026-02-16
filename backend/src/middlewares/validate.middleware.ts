import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../lib/errors';

export type ValidationSchema = {
  [key: string]: { required?: boolean; isEmail?: boolean; minLength?: number };
};

function validateBody(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const body = req.body || {};
    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      if (rules.required && (value === undefined || value === null || value === '')) {
        next(new ValidationError(`Field "${field}" is required`));
        return;
      }
      if (value !== undefined && value !== null && value !== '') {
        if (rules.isEmail && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            next(new ValidationError(`Field "${field}" must be a valid email`));
            return;
          }
        }
        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
          next(
            new ValidationError(`Field "${field}" must be at least ${rules.minLength} characters`)
          );
          return;
        }
      }
    }
    next();
  };
}

export const validateRegister = validateBody({
  name: { required: true, minLength: 1 },
  phone: { required: true, minLength: 1 },
});

export const validateLogin = validateBody({
  name: { required: true, minLength: 1 },
  phone: { required: true, minLength: 1 },
});

export const validateCreatePrompt = validateBody({
  categoryId: { required: true },
  subCategoryId: { required: true },
  prompt: { required: true, minLength: 1 },
});

export const validateCategoryName = validateBody({ name: { required: true, minLength: 1 } });

export const validateAdminCreateUser = validateBody({
  name: { required: true, minLength: 1 },
  phone: { required: true, minLength: 1 },
});

export const validateAdminUpdateUser = validateBody({
  name: { minLength: 1 },
  phone: { minLength: 1 },
});
