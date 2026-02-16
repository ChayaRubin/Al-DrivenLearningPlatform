import { Request, Response, NextFunction } from 'express';
import * as promptService from '../services/prompt.service';
import { UnauthorizedError } from '../lib/errors';

export async function createPrompt(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) return next(new UnauthorizedError());
    const { categoryId, subCategoryId, prompt: userPrompt } = req.body;
    const prompt = await promptService.createPrompt({
      userId: req.user.id,
      categoryId,
      subCategoryId,
      prompt: userPrompt,
    });
    res.status(201).json({ data: prompt });
  } catch (e) {
    next(e);
  }
}

export async function getMyHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) return next(new UnauthorizedError());
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 10));
    const result = await promptService.getHistoryByUserId(req.user.id, page, limit);
    res.json({ data: result.data, total: result.total, page: result.page, limit: result.limit });
  } catch (e) {
    next(e);
  }
}
