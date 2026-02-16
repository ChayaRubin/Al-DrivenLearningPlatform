import { PrismaClient, Role } from '@prisma/client';
import { NotFoundError, ValidationError } from '../lib/errors';

const prisma = new PrismaClient();

export interface CreateUserInput {
  name: string;
  phone: string;
}

export interface UserResponse {
  id: string;
  name: string;
  phone: string;
  role: Role;
  createdAt: Date;
}

export async function createUser(input: CreateUserInput): Promise<UserResponse> {
  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existing) {
    throw new ValidationError('Phone already registered');
  }
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      phone: input.phone.trim(),
      role: 'USER',
    },
  });
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export interface AdminCreateUserInput {
  name: string;
  phone: string;
  role?: Role;
}

export async function adminCreateUser(input: AdminCreateUserInput): Promise<UserResponse> {
  const existing = await prisma.user.findUnique({ where: { phone: input.phone.trim() } });
  if (existing) {
    throw new ValidationError('Phone already registered');
  }
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      phone: input.phone.trim(),
      role: input.role ?? 'USER',
    },
  });
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  role?: Role;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserResponse> {
  const user = await getUserOrThrow(id);
  if (input.phone !== undefined && input.phone.trim() !== user.phone) {
    const existing = await prisma.user.findUnique({ where: { phone: input.phone.trim() } });
    if (existing) {
      throw new ValidationError('Phone already in use');
    }
  }
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.phone !== undefined && { phone: input.phone.trim() }),
      ...(input.role !== undefined && { role: input.role }),
    },
  });
  return {
    id: updated.id,
    name: updated.name,
    phone: updated.phone,
    role: updated.role,
    createdAt: updated.createdAt,
  };
}

export async function deleteUser(id: string): Promise<void> {
  await getUserOrThrow(id);
  await prisma.user.delete({ where: { id } });
}

export async function findByNameAndPhone(name: string, phone: string) {
  return prisma.user.findFirst({
    where: { name: name.trim(), phone: phone.trim() },
  });
}

export async function findById(id: string): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, phone: true, role: true, createdAt: true },
  });
  return user;
}

export async function listUsers(skip: number, take: number) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, phone: true, role: true, createdAt: true },
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
