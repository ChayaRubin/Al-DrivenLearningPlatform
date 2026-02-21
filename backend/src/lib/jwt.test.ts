import { signToken, verifyToken } from './jwt';

describe('jwt', () => {
  const payload = { userId: 'user-123', role: 'USER' as const };

  describe('signToken', () => {
    it('returns a non-empty string', () => {
      const token = signToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('returns different tokens for different payloads', () => {
      const token1 = signToken({ userId: 'a', role: 'USER' });
      const token2 = signToken({ userId: 'b', role: 'USER' });
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('decodes a valid token to the original payload', () => {
      const token = signToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });

    it('throws on invalid token', () => {
      expect(() => verifyToken('not-a-valid-jwt')).toThrow();
    });

    it('throws on tampered token', () => {
      const token = signToken(payload);
      const tampered = token.slice(0, -2) + 'xx';
      expect(() => verifyToken(tampered)).toThrow();
    });
  });
});
