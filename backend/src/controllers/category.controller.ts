import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';
import { NotFoundError } from '../lib/errors';

export async function listCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await categoryService.listCategories();
    res.json({ data: categories });
  } catch (e) {
    next(e);
  }
}

export async function getSubCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: categoryId } = req.params;
    const category = await categoryService.getCategoryById(categoryId);
    if (!category) {
      next(new NotFoundError('Category not found'));
      return;
    }
    const subCategories = await categoryService.getSubCategoriesByCategoryId(categoryId);
    res.json({ data: subCategories });
  } catch (e) {
    next(e);
  }
}
