import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../lib/errors';

const prisma = new PrismaClient();

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { subCategories: true },
  });
}

export async function getSubCategoriesByCategoryId(categoryId: string) {
  return prisma.subCategory.findMany({
    where: { categoryId },
    orderBy: { name: 'asc' },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function getSubCategoryById(id: string) {
  return prisma.subCategory.findUnique({ where: { id } });
}

export async function createCategory(name: string) {
  return prisma.category.create({ data: { name: name.trim() } });
}

export async function updateCategory(id: string, name: string) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Category not found');
  return prisma.category.update({ where: { id }, data: { name: name.trim() } });
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Category not found');
  return prisma.category.delete({ where: { id } });
}

export async function createSubCategory(categoryId: string, name: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new NotFoundError('Category not found');
  return prisma.subCategory.create({ data: { categoryId, name: name.trim() } });
}

export async function updateSubCategory(id: string, name: string) {
  const existing = await prisma.subCategory.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('SubCategory not found');
  return prisma.subCategory.update({ where: { id }, data: { name: name.trim() } });
}

export async function deleteSubCategory(id: string) {
  const existing = await prisma.subCategory.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('SubCategory not found');
  return prisma.subCategory.delete({ where: { id } });
}
