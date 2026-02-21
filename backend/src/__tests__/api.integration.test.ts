import request from 'supertest';
import { PrismaClient, Role } from '@prisma/client';
import app from '../server';

const prisma = new PrismaClient();

describe('API integration', () => {
  describe('GET /health', () => {
    it('returns 200 and status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /auth/register', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ phone: '123456' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('returns 400 when phone is missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('registers and returns 201 with user and token', async () => {
      const phone = `1555${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Flow Test User', phone })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.name).toBe('Flow Test User');
      expect(res.body.data.user.phone).toBe(phone);
      expect(res.body.data.user.role).toBe('USER');
    });
  });

  describe('POST /auth/login', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ phone: '123456' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('returns 400 when phone is missing', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ name: 'Test' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('auth flow: register → login → protected route', () => {
    it('full flow: register, login, GET /users/me, then admin route with USER returns 403', async () => {
      const phone = `1555${Date.now()}${Math.floor(Math.random() * 10000)}`;
      const name = 'Auth Flow User';

      const registerRes = await request(app)
        .post('/auth/register')
        .send({ name, phone })
        .set('Content-Type', 'application/json');
      expect(registerRes.status).toBe(201);
      const token = registerRes.body.data.token;
      const userId = registerRes.body.data.user.id;
      expect(token).toBeDefined();
      expect(userId).toBeDefined();

      const loginRes = await request(app)
        .post('/auth/login')
        .send({ name, phone })
        .set('Content-Type', 'application/json');
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.token).toBeDefined();
      expect(loginRes.body.data.user.id).toBe(userId);

      const meRes = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`);
      expect(meRes.status).toBe(200);
      expect(meRes.body.data.id).toBe(userId);
      expect(meRes.body.data.name).toBe(name);

      const adminRes = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${token}`);
      expect(adminRes.status).toBe(403);
    });

    it('GET /users/me without token returns 401', async () => {
      const res = await request(app).get('/users/me');
      expect(res.status).toBe(401);
    });

    it('GET /admin/users without token returns 401', async () => {
      const res = await request(app).get('/admin/users');
      expect(res.status).toBe(401);
    });

    it('GET /admin/users with valid ADMIN token returns 200 and data array', async () => {
      const phone = `1555${Date.now()}${Math.floor(Math.random() * 10000)}`;
      const name = 'Admin Flow User';
      const registerRes = await request(app)
        .post('/auth/register')
        .send({ name, phone })
        .set('Content-Type', 'application/json');
      expect(registerRes.status).toBe(201);
      const userId = registerRes.body.data.user.id;

      await prisma.user.update({
        where: { id: userId },
        data: { role: Role.ADMIN },
      });

      const loginRes = await request(app)
        .post('/auth/login')
        .send({ name, phone })
        .set('Content-Type', 'application/json');
      expect(loginRes.status).toBe(200);
      const token = loginRes.body.data.token;

      const adminRes = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${token}`);
      expect(adminRes.status).toBe(200);
      expect(Array.isArray(adminRes.body.data)).toBe(true);
    });
  });
});
