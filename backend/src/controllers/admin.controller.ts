import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import * as userService from '../services/user.service';
import * as promptService from '../services/prompt.service';
import * as categoryService from '../services/category.service';
import * as aiService from '../services/ai.service';

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 10));
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const role = typeof req.query.role === 'string' ? req.query.role : undefined;
    const result = await userService.listUsers((page - 1) * limit, limit, { search, role });
    res.json({ data: result.data, total: result.total, page, limit });
  } catch (e) {
    next(e);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, phone, role } = req.body;
    const user = await userService.adminCreateUser({ name, phone, role });
    res.status(201).json({ data: user });
  } catch (e) {
    next(e);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, phone, role } = req.body;
    const payload: userService.UpdateUserInput = {};
    if (name !== undefined) payload.name = name;
    if (phone !== undefined) payload.phone = phone;
    if (role !== undefined && Object.values(Role).includes(role)) payload.role = role as Role;
    const user = await userService.updateUser(id, payload);
    res.json({ data: user });
  } catch (e) {
    next(e);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function listPrompts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 10));
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const result = await promptService.listPrompts(page, limit, search);
    res.json({ data: result.data, total: result.total, page: result.page, limit: result.limit });
  } catch (e) {
    next(e);
  }
}

export async function listCategoriesAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await categoryService.listCategories();
    res.json({ data: categories });
  } catch (e) {
    next(e);
  }
}

export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, imageUrl } = req.body;
    const category = await categoryService.createCategory(name, imageUrl);
    res.status(201).json({ data: category });
  } catch (e) {
    next(e);
  }
}

export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { name, imageUrl } = req.body;
    const category = await categoryService.updateCategory(id, name, imageUrl);
    res.json({ data: category });
  } catch (e) {
    next(e);
  }
}

export async function generateCategoryImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    const dataUrl = await aiService.generateCategoryImage(category.name);
    const categoryUpdated = await categoryService.setCategoryImage(id, dataUrl);
    res.json({ data: categoryUpdated });
  } catch (e) {
    next(e);
  }
}

export async function uploadCategoryImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const file = (req as Request & { file?: Express.Multer.File & { buffer?: Buffer } }).file;
    const buffer = file?.buffer;
    if (!buffer) {
      res.status(400).json({
        error: 'No image file received. Use "Choose from PC" and select an image (JPEG, PNG, GIF, or WebP).',
      });
      return;
    }
    const base64 = buffer.toString('base64');
    const mime = file.mimetype || 'image/png';
    const dataUrl = `data:${mime};base64,${base64}`;
    const categoryUpdated = await categoryService.setCategoryImage(id, dataUrl);
    res.json({ data: categoryUpdated });
  } catch (e) {
    next(e);
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function createSubCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    const subCategory = await categoryService.createSubCategory(categoryId, name);
    res.status(201).json({ data: subCategory });
  } catch (e) {
    next(e);
  }
}

export async function updateSubCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const subCategory = await categoryService.updateSubCategory(id, name);
    res.json({ data: subCategory });
  } catch (e) {
    next(e);
  }
}

export async function deleteSubCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await categoryService.deleteSubCategory(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
