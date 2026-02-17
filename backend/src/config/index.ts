import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d', // e.g. '7d' or number of seconds
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  /** Optional. Set in production to your frontend URL (e.g. https://your-app.vercel.app) for CORS. */
  corsOrigin: process.env.CORS_ORIGIN || undefined,
};
