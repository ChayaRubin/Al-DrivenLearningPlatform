import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from './errors';

describe('errors', () => {
  describe('AppError', () => {
    it('sets message and statusCode', () => {
      const err = new AppError('Something broke', 500);
      expect(err.message).toBe('Something broke');
      expect(err.statusCode).toBe(500);
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('AppError');
    });
  });

  describe('UnauthorizedError', () => {
    it('defaults to 401 and UNAUTHORIZED', () => {
      const err = new UnauthorizedError();
      expect(err.message).toBe('Unauthorized');
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
      expect(err).toBeInstanceOf(AppError);
    });
  });

  describe('ForbiddenError', () => {
    it('defaults to 403 and FORBIDDEN', () => {
      const err = new ForbiddenError();
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('FORBIDDEN');
    });
  });

  describe('NotFoundError', () => {
    it('defaults to 404 and NOT_FOUND', () => {
      const err = new NotFoundError('User not found');
      expect(err.message).toBe('User not found');
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
    });
  });

  describe('ValidationError', () => {
    it('defaults to 400 and VALIDATION_ERROR', () => {
      const err = new ValidationError('Phone already registered');
      expect(err.message).toBe('Phone already registered');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('VALIDATION_ERROR');
    });
  });
});
