import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateCategoryName } from '../middlewares/validate.middleware';
import {
  listUsers,
  listPrompts,
  listCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../controllers/admin.controller';

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireRole(Role.ADMIN));

adminRoutes.get('/users', listUsers);
adminRoutes.get('/prompts', listPrompts);

adminRoutes.get('/categories', listCategoriesAdmin);
adminRoutes.post('/categories', validateCategoryName, createCategory);
adminRoutes.patch('/categories/:id', validateCategoryName, updateCategory);
adminRoutes.delete('/categories/:id', deleteCategory);

adminRoutes.post('/categories/:categoryId/subcategories', validateCategoryName, createSubCategory);
adminRoutes.patch('/subcategories/:id', validateCategoryName, updateSubCategory);
adminRoutes.delete('/subcategories/:id', deleteSubCategory);
