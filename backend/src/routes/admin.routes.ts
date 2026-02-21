import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateCategoryName } from '../middlewares/validate.middleware';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listPrompts,
  listCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  generateCategoryImage,
  uploadCategoryImage,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../controllers/admin.controller';
import { uploadSingleImage } from '../middlewares/upload.middleware';
import {
  validateAdminCreateUser,
  validateAdminUpdateUser,
} from '../middlewares/validate.middleware';

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireRole(Role.ADMIN));

adminRoutes.get('/users', listUsers);
adminRoutes.post('/users', validateAdminCreateUser, createUser);
adminRoutes.patch('/users/:id', validateAdminUpdateUser, updateUser);
adminRoutes.delete('/users/:id', deleteUser);
adminRoutes.get('/prompts', listPrompts);

adminRoutes.get('/categories', listCategoriesAdmin);
adminRoutes.post('/categories', validateCategoryName, createCategory);
adminRoutes.patch('/categories/:id', validateCategoryName, updateCategory);
adminRoutes.delete('/categories/:id', deleteCategory);
adminRoutes.post('/categories/:id/generate-image', generateCategoryImage);
adminRoutes.post('/categories/:id/image', uploadSingleImage, uploadCategoryImage);

adminRoutes.post('/categories/:categoryId/subcategories', validateCategoryName, createSubCategory);
adminRoutes.patch('/subcategories/:id', validateCategoryName, updateSubCategory);
adminRoutes.delete('/subcategories/:id', deleteSubCategory);
