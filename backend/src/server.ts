import './types';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { errorHandler } from './middlewares/error.middleware';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { categoryRoutes } from './routes/category.routes';
import { promptRoutes } from './routes/prompt.routes';
import { adminRoutes } from './routes/admin.routes';
import openapiSpec from './openapi';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec as swaggerUi.JsonObject));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/prompts', promptRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test' && process.env.VERCEL !== '1') {
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

export default app;
