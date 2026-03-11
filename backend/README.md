# Mini Learning Platform – Backend

Node.js + Express + TypeScript + Prisma + OpenAI. JWT auth and role-based admin.

## Setup

### 1. Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` – PostgreSQL connection string (see Docker below)
- `JWT_SECRET` – Secret for signing JWTs (use a strong value in production)
- `OPENAI_API_KEY` – Your OpenAI API key for lesson generation. If you get **401 "Missing scopes: model.request"**, your key is restricted: in [OpenAI API Keys](https://platform.openai.com/api-keys) edit the key and enable the **model.request** scope, or create a new unrestricted key.
- `OPENAI_CHAT_MODEL` – (Optional) Chat model for lessons. Default `gpt-3.5-turbo`. If you get **403 "Project does not have access to model"**, set this to a model your OpenAI project supports (e.g. `gpt-4o`, `gpt-4-turbo`). Check [OpenAI API → Models](https://platform.openai.com/docs/models) or your project’s usage/settings to see which model IDs you can use.

### 2. PostgreSQL – choose one

#### Option A: Local PostgreSQL via Docker (recommended for dev)

1. **Install Docker**  
   [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/) – install and start it (Docker must be running).

2. **Start the database** – from the `backend` directory:

   ```bash
   docker compose up -d
   ```

3. **Check it’s running:**

   ```bash
   docker ps
   ```

   You should see a container like `mini-learning-db` (postgres:16-alpine).  
   The `mini_learning` database is created automatically on first start.

4. **Use this in `.env`:**

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_learning?schema=public"
   ```

#### Option B: Real (cloud) PostgreSQL

If Docker doesn’t work or you want a hosted DB, use a free PostgreSQL service and put its URL in `DATABASE_URL`:

- **[Neon](https://neon.tech)** – sign up, create a project, copy the connection string.
- **[Supabase](https://supabase.com)** – create a project → Settings → Database → Connection string (URI).
- **[Railway](https://railway.app)** – new project → Add PostgreSQL → copy `DATABASE_URL`.

Then in `backend/.env`:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

Use the exact URL from the provider (they often add `?sslmode=require` for SSL).

### 3. Install and database

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

- First time: `migrate dev` will create all tables. If asked for a migration name, use e.g. `init`.
- Seed creates:

- Admin user: `admin@example.com` / `admin123`
- Categories: Programming (JavaScript, TypeScript), Mathematics (Algebra)

### 4. Run

```bash
npm run dev
```

Server runs at `http://localhost:3000`.

### API documentation Swagger

You can explore and try the API in the browser using Swagger UI:

- **Local:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Production (Render):** `https://ai-driven-learning-backend.onrender.com/api-docs/`

In Swagger UI you can view all endpoints, request/response schemas, and use **Try it out** to send requests. For protected routes, click **Authorize** and paste a JWT (from `POST /auth/login` or `POST /auth/register`).

### Main endpoints

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

## Troubleshooting

**“Database doesn’t exist” / connection refused**

**"401 Missing scopes: model.request"** – The API key doesn’t have permission to call the AI. If you have access to [OpenAI API Keys](https://platform.openai.com/api-keys), edit the key and add the **model.request** scope (or create an unrestricted key). If someone else gave you the key, ask them to enable **model.request** for that key or to provide an unrestricted key.

**"403 Project does not have access to model"** – Set **`OPENAI_CHAT_MODEL`** to a model your OpenAI project supports (e.g. `gpt-4o`, `gpt-4-turbo`). Local: add to `.env`. Render: add env var in dashboard and redeploy.

- **Docker:** Ensure Docker Desktop is running, then from `backend/`: `docker compose up -d`. Run `docker ps` to confirm the postgres container is up.
- **Port 5432 in use:** Another app may be using it. Stop that service or change the port in `docker-compose.yml` (e.g. `"5433:5432"`) and use port 5433 in `DATABASE_URL`.
- **Use a cloud DB:** See “Option B: Real (cloud) PostgreSQL” above – sign up at Neon or Supabase, get a connection string, put it in `.env` as `DATABASE_URL`, then run `npx prisma migrate dev` and `npx prisma db seed`.

## Assumptions

- JWT in `Authorization: Bearer <token>`.
- Admin role required for `/admin/*`; created via seed only.
- Pagination: `?page=1&limit=10` on list endpoints.
