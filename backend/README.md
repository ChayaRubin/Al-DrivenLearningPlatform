# Mini Learning Platform – Backend

Node.js + Express + TypeScript + Prisma + OpenAI. JWT auth and role-based admin.

## Setup

### 1. Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` – PostgreSQL connection string (see Docker below)
- `JWT_SECRET` – Secret for signing JWTs (use a strong value in production)
- `OPENAI_API_KEY` – Your OpenAI API key for lesson generation

### 2. PostgreSQL (Docker)

From the `backend` directory:

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:

- User: `postgres`
- Password: `postgres`
- Database: `mini_learning`

So `DATABASE_URL` can be:

```
postgresql://postgres:postgres@localhost:5432/mini_learning?schema=public
```

### 3. Install and database

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

Seed creates:

- Admin user: `admin@example.com` / `admin123`
- Categories: Programming (JavaScript, TypeScript), Mathematics (Algebra)

### 4. Run

```bash
npm run dev
```

Server runs at `http://localhost:3000`.

- `GET /health` – health check
- `POST /auth/register` – register
- `POST /auth/login` – login
- `GET /users/me` – current user (auth required)
- `GET /users/me/history` – my prompts (auth required)
- `GET /categories` – list categories
- `GET /categories/:id/subcategories` – subcategories
- `POST /prompts` – create prompt + AI lesson (auth required)
- `GET /admin/users` – list users (admin only)
- `GET /admin/prompts` – list prompts (admin only)

## Assumptions

- JWT in `Authorization: Bearer <token>`.
- Admin role required for `/admin/*`; created via seed only.
- Pagination: `?page=1&limit=10` on list endpoints.
