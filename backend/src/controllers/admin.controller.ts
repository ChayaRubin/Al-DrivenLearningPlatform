import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import * as promptService from '../services/prompt.service';
import * as categoryService from '../services/category.service';

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 10));
    const result = await userService.listUsers((page - 1) * limit, limit);
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
    const payload: { name?: string; phone?: string; role?: string } = {};
    if (name !== undefined) payload.name = name;
    if (phone !== undefined) payload.phone = phone;
    if (role !== undefined) payload.role = role;
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
    const result = await promptService.listPrompts(page, limit);
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
    const { name } = req.body;
    const category = await categoryService.createCategory(name);
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
    const { name } = req.body;
    const category = await categoryService.updateCategory(id, name);
    res.json({ data: category });
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
