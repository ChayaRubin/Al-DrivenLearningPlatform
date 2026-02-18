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

/** Returns the origin to allow for CORS, or null if not allowed. */
function getAllowedOrigin(origin: string | undefined): string | null {
  if (!origin) return null;
  if (config.corsOrigin && origin === config.corsOrigin) return origin;
  if (origin.endsWith('.vercel.app')) return origin;
  try {
    const u = new URL(origin);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return origin;
  } catch {
    /* ignore */
  }
  if (config.nodeEnv === 'development') return origin;
  return null;
}

// Handle preflight (OPTIONS) first so CORS headers are always set on Vercel serverless
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') return next();
  const origin = req.headers.origin as string | undefined;
  const allow = getAllowedOrigin(origin);
  if (allow) {
    res.setHeader('Access-Control-Allow-Origin', allow);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  res.status(204).end();
});

app.use(
  cors({
    origin: (origin, cb) => {
      const allow = getAllowedOrigin(origin);
      cb(null, allow !== null ? allow : false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
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
