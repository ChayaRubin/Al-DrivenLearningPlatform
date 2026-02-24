# Mini Learning Platform (MVP)

Full-stack mini learning platform: register, pick category/subcategory, submit a learning prompt, get an AI-generated lesson, view history. Admin can view all users and prompts.

## Stack

- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Prisma, OpenAI, JWT, bcrypt
- **Frontend:** React, TypeScript, Vite, Axios, React Router
- **DB:** PostgreSQL (Docker)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
docker compose up -d
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Backend: `http://localhost:3000`  
API docs (Swagger): `http://localhost:3000/api-docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173` (proxies API to backend)

### 3. Use the app

- **Register** a new user or **login** with `admin@example.com` / `admin123`.
- **Dashboard:** choose category/subcategory, enter a learning prompt, submit to get an AI lesson.
- **Learning History:** view your past prompts and lessons (paginated).
- **Admin** (admin user only): view all users and all prompts with pagination.

## Project layout

```
backend/          – Express API, Prisma, OpenAI
frontend/         – React SPA (Vite)
TODO.md           – Task checklist
```

See `backend/README.md` for API details, env vars, and how to run the API using Swagger.

## Assumptions

- Auth: JWT; token stored in localStorage; 401 clears token and redirects to login.
- Admin: role `ADMIN`; only seed creates admin users; `/admin/*` protected by middleware.
- API responses: success `{ data }`, errors `{ error, code }` with appropriate status codes.
