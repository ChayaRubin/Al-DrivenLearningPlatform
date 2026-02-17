import './types';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middlewares/error.middleware';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { categoryRoutes } from './routes/category.routes';
import { promptRoutes } from './routes/prompt.routes';
import { adminRoutes } from './routes/admin.routes';

const app = express();

app.use(cors(config.corsOrigin ? { origin: config.corsOrigin } : {}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/prompts', promptRoutes);
app.use('/admin', adminRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'API is running', health: '/health' });
});
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

// On Vercel, the app is used as serverless handler; don't call listen.
if (process.env.VERCEL !== '1') {
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

export default app;
