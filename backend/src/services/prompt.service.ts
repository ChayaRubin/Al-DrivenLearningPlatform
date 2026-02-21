import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../lib/errors';
import * as categoryService from './category.service';
import * as aiService from './ai.service';

const prisma = new PrismaClient();

export interface CreatePromptInput {
  userId: string;
  categoryId: string;
  subCategoryId: string;
  prompt: string;
}

export async function createPrompt(input: CreatePromptInput) {
  const category = await categoryService.getCategoryById(input.categoryId);
  if (!category) throw new NotFoundError('Category not found');
  const subCategories = await categoryService.getSubCategoriesByCategoryId(input.categoryId);
  const sub = subCategories.find((s) => s.id === input.subCategoryId);
  if (!sub) throw new NotFoundError('SubCategory not found');

  const generatedLesson = await aiService.generateLesson(category.name, sub.name, input.prompt);

  const prompt = await prisma.prompt.create({
    data: {
      userId: input.userId,
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId,
      userPrompt: input.prompt,
      generatedLesson,
    },
    include: {
      category: { select: { name: true } },
      subCategory: { select: { name: true } },
    },
  });
  return prompt;
}

export async function getHistoryByUserId(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.prompt.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
      },
    }),
    prisma.prompt.count({ where: { userId } }),
  ]);
  return { data, total, page, limit };
}

export async function listPrompts(
  page = 1,
  limit = 10,
  search?: string
) {
  const where = search?.trim()
    ? {
        OR: [
          { userPrompt: { contains: search.trim(), mode: 'insensitive' as const } },
          { generatedLesson: { contains: search.trim(), mode: 'insensitive' as const } },
          { category: { name: { contains: search.trim(), mode: 'insensitive' as const } } },
          { subCategory: { name: { contains: search.trim(), mode: 'insensitive' as const } } },
          { user: { name: { contains: search.trim(), mode: 'insensitive' as const } } },
          { user: { phone: { contains: search.trim(), mode: 'insensitive' as const } } },
        ],
      }
    : undefined;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.prompt.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
      },
    }),
    prisma.prompt.count({ where }),
  ]);
  return { data, total, page, limit };
}
