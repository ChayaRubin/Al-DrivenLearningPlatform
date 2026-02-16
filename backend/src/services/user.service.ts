import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { NotFoundError, ValidationError } from '../lib/errors';

const prisma = new PrismaClient();

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: Role;
  createdAt: Date;
}

export async function createUser(input: CreateUserInput): Promise<UserResponse> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ValidationError('Email already registered');
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name ?? null,
      phone: input.phone ?? null,
      role: 'USER',
    },
  });
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findById(id: string): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
  });
  return user;
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function listUsers(skip: number, take: number) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);
  return { data: users, total };
}

export async function getUserOrThrow(id: string): Promise<UserResponse> {
  const user = await findById(id);
  if (!user) throw new NotFoundError('User not found');
  return user;
}
