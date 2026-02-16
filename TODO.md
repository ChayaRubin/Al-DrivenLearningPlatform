# Mini Learning Platform MVP – Todo List

Realistic for a 2–3 day MVP. No unnecessary features.

---

## 1. Backend Core

| #   | ID                  | Task                                                                                               | Status |
| --- | ------------------- | -------------------------------------------------------------------------------------------------- | ------ |
| 1   | backend-scaffold    | Backend scaffold: folders, package.json, tsconfig, config, server.ts, docker-compose, .env.example | Done   |
| 2   | prisma-schema       | Prisma schema: User (role enum), Category, SubCategory, Prompt + relations and indexes             | Done   |
| 3   | prisma-migrate-seed | Prisma: initial migration + seed (admin user + categories/subcategories)                           | Done   |

---

## 2. Auth & Security

| #   | ID                      | Task                                                                                                                                  | Status |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 4   | lib-jwt-errors          | lib: jwt.ts (sign/verify) + custom error types for 401/403/400/404                                                                    | Done   |
| 5   | user-service            | user.service: create (hash), findByEmail, findById, listUsers; no logic in routes                                                     | Done   |
| 6   | auth-middlewares        | Middlewares: auth (JWT → req.user), requireRole(admin)                                                                                | Done   |
| 7   | error-handling-response | Error handling middleware + consistent API response format (success `{ data }`, error `{ error, code }`, proper status codes 4xx/5xx) | Done   |
| 8   | request-validation      | Request validation for register, login, create prompt (e.g. express-validator or manual checks)                                       | Done   |
| 9   | auth-routes             | Auth routes: POST /auth/register, POST /auth/login                                                                                    | Done   |

---

## 3. Learning Flow

| #   | ID                      | Task                                                                               | Status |
| --- | ----------------------- | ---------------------------------------------------------------------------------- | ------ |
| 10  | category-service-routes | category.service + GET /categories, GET /categories/:id/subcategories              | Done   |
| 11  | ai-service              | ai.service: generateLesson(category, subCategory, prompt) via OpenAI SDK           | Done   |
| 12  | prompt-service-routes   | prompt.service (create + history) + POST /prompts, GET /users/me/history with auth | Done   |
| 13  | users-me-route          | GET /users/me (current user)                                                       | Done   |

---

## 4. Admin

| #   | ID           | Task                                                                             | Status |
| --- | ------------ | -------------------------------------------------------------------------------- | ------ |
| 14  | admin-routes | Admin: GET /admin/users, GET /admin/prompts with pagination + requireRole(admin) | Done   |

---

## 5. Frontend

| #   | ID                         | Task                                                                                      | Status |
| --- | -------------------------- | ----------------------------------------------------------------------------------------- | ------ |
| 15  | frontend-scaffold          | Frontend: Vite + React + TS, Axios, folder structure (components, pages, services, hooks) | Done   |
| 16  | frontend-api-auth          | Frontend: api.ts with base URL, Bearer token, 401 → logout; auth API (login, register)    | Done   |
| 17  | frontend-auth-pages        | Frontend: Login and Register pages + token storage + redirect when authenticated          | Done   |
| 18  | frontend-layout-nav        | Frontend: Dashboard layout, sidebar, header, role-based Admin link                        | Done   |
| 19  | frontend-dashboard-history | Frontend: Dashboard (prompt form), Learning History page                                  | Done   |
| 20  | frontend-admin-page        | Frontend: Admin page (users + prompts lists with pagination), protect route               | Done   |

---

## 6. Documentation

| #   | ID              | Task                                                                  | Status |
| --- | --------------- | --------------------------------------------------------------------- | ------ |
| 21  | backend-readme  | Backend README: setup, Docker, env, migrate, seed, run instructions   | Done   |
| 22  | frontend-readme | Frontend/root README: full setup, run backend + frontend, assumptions | Done   |

---

## 7. User name & phone (spec alignment)

| #   | ID                       | Task                                                                 | Status |
| --- | ------------------------ | -------------------------------------------------------------------- | ------ |
| 23  | user-name-phone-schema   | User model: add name, phone (Prisma + migration)                     | Done   |
| 24  | user-name-phone-backend  | Register validation, user.service, API responses include name, phone | Done   |
| 25  | user-name-phone-frontend | Register form: name, phone; Admin users table: show name, phone      | Done   |

---

## Checklist (tick as you go)

**1. Backend Core**

- [x] Backend scaffold: folders, package.json, tsconfig, config, server.ts, docker-compose, .env.example
- [x] Prisma schema: User (role enum), Category, SubCategory, Prompt + relations and indexes
- [x] Prisma: initial migration + seed (admin user + categories/subcategories)

**2. Auth & Security**

- [x] lib: jwt.ts (sign/verify) + custom error types for 401/403/400/404
- [x] user.service: create (hash), findByEmail, findById, listUsers
- [x] Middlewares: auth (JWT → req.user), requireRole(admin)
- [x] Error handling middleware + consistent API response format (success `{ data }`, error `{ error, code }`, status codes)
- [x] Request validation for register, login, create prompt
- [x] Auth routes: POST /auth/register, POST /auth/login

**3. Learning Flow**

- [x] category.service + GET /categories, GET /categories/:id/subcategories
- [x] ai.service: generateLesson(category, subCategory, prompt) via OpenAI SDK
- [x] prompt.service (create + history) + POST /prompts, GET /users/me/history with auth
- [x] GET /users/me (current user)

**4. Admin**

- [x] Admin: GET /admin/users, GET /admin/prompts with pagination + requireRole(admin)

**5. Frontend**

- [x] Frontend: Vite + React + TS, Axios, folder structure (components, pages, services, hooks)
- [x] Frontend: api.ts with base URL, Bearer token, 401 → logout; auth API (login, register)
- [x] Frontend: Login and Register pages + token storage + redirect when authenticated
- [x] Frontend: Dashboard layout, sidebar, header, role-based Admin link
- [x] Frontend: Dashboard (prompt form), Learning History page
- [x] Frontend: Admin page (users + prompts lists with pagination), protect route

**6. Documentation**

- [x] Backend README: setup, Docker, env, migrate, seed, run instructions
- [x] Frontend/root README: full setup, run backend + frontend, assumptions

**7. User name & phone**

- [x] User model: add name, phone (Prisma + migration)
- [x] Register validation and user.service/API include name, phone
- [x] Register form and Admin users table: name, phone
