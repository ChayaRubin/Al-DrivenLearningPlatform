import { Router } from 'express';
import { listCategories, getSubCategories } from '../controllers/category.controller';

export const categoryRoutes = Router();

categoryRoutes.get('/', listCategories);
categoryRoutes.get('/:id/subcategories', getSubCategories);
