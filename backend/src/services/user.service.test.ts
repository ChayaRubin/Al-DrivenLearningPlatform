import { Role } from '@prisma/client';
const mockUser = {
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  Role: { USER: 'USER', ADMIN: 'ADMIN' },
  PrismaClient: jest.fn(function (this: { user: typeof mockUser }) {
    this.user = mockUser;
    return this;
  }),
}));

import * as userService from './user.service';

describe('user.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createdUser = {
    id: 'user-1',
    name: 'Test User',
    phone: '5551234567',
    role: Role.USER,
    createdAt: new Date('2025-01-01'),
  };

  describe('createUser', () => {
    it('creates user when phone is not registered', async () => {
      mockUser.findUnique.mockResolvedValue(null);
      mockUser.create.mockResolvedValue(createdUser);

      const result = await userService.createUser({
        name: '  Test User  ',
        phone: '5551234567',
      });

      expect(mockUser.findUnique).toHaveBeenCalledWith({ where: { phone: '5551234567' } });
      expect(mockUser.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          phone: '5551234567',
          role: 'USER',
        },
      });
      expect(result).toEqual(createdUser);
    });

    it('throws ValidationError when phone already registered', async () => {
      mockUser.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        userService.createUser({ name: 'Test', phone: '5551234567' })
      ).rejects.toThrow('Phone already registered');

      expect(mockUser.create).not.toHaveBeenCalled();
    });
  });

  describe('findByNameAndPhone', () => {
    it('returns user when found', async () => {
      mockUser.findFirst.mockResolvedValue(createdUser);

      const result = await userService.findByNameAndPhone('Test User', '5551234567');

      expect(mockUser.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test User', phone: '5551234567' },
      });
      expect(result).toEqual(createdUser);
    });

    it('returns null when not found', async () => {
      mockUser.findFirst.mockResolvedValue(null);

      const result = await userService.findByNameAndPhone('Unknown', '0000000000');

      expect(result).toBeNull();
    });

    it('trims name and phone', async () => {
      mockUser.findFirst.mockResolvedValue(null);

      await userService.findByNameAndPhone('  Jane  ', '  5551234567  ');

      expect(mockUser.findFirst).toHaveBeenCalledWith({
        where: { name: 'Jane', phone: '5551234567' },
      });
    });
  });

  describe('getUserOrThrow', () => {
    it('returns user when found', async () => {
      mockUser.findUnique.mockResolvedValue(createdUser);

      const result = await userService.getUserOrThrow('user-1');

      expect(mockUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { id: true, name: true, phone: true, role: true, createdAt: true },
      });
      expect(result).toEqual(createdUser);
    });

    it('throws NotFoundError when user does not exist', async () => {
      mockUser.findUnique.mockResolvedValue(null);

      await expect(userService.getUserOrThrow('missing-id')).rejects.toThrow('User not found');
    });
  });

  describe('adminCreateUser', () => {
    it('creates user with default USER role when role not provided', async () => {
      mockUser.findUnique.mockResolvedValue(null);
      mockUser.create.mockResolvedValue(createdUser);

      const result = await userService.adminCreateUser({
        name: 'Admin Created',
        phone: '5559876543',
      });

      expect(mockUser.create).toHaveBeenCalledWith({
        data: {
          name: 'Admin Created',
          phone: '5559876543',
          role: 'USER',
        },
      });
      expect(result.role).toBe(Role.USER);
    });

    it('creates user with ADMIN role when provided', async () => {
      mockUser.findUnique.mockResolvedValue(null);
      const adminUser = { ...createdUser, id: 'admin-1', role: Role.ADMIN };
      mockUser.create.mockResolvedValue(adminUser);

      await userService.adminCreateUser({
        name: 'Admin User',
        phone: '5551111111',
        role: Role.ADMIN,
      });

      expect(mockUser.create).toHaveBeenCalledWith({
        data: {
          name: 'Admin User',
          phone: '5551111111',
          role: Role.ADMIN,
        },
      });
    });
  });
});
