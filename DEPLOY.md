# Deploy your app for free (Vercel + Neon)

You can host this project for free using **Vercel** (frontend + backend) and **Neon** (PostgreSQL). Vercel’s free tier allows many projects, so you can use it even if you already have something on Render.

## What you’ll set up

1. **Neon** – free PostgreSQL database  
2. **Vercel – Backend** – one project for the API  
3. **Vercel – Frontend** – one project for the React app  

---

## 1. Database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up (free).
2. Create a new project and pick a region close to you.
3. In the dashboard, open the **Connection string** (or “Connection details”). Copy the **connection string** (e.g. `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`). This is your `DATABASE_URL`.
4. Run migrations and seed **from your machine** (one time), with `DATABASE_URL` set:

   ```bash
   cd backend
   set DATABASE_URL=your_neon_connection_string_here
   npx prisma migrate deploy
   npx prisma db seed
   ```

   On macOS/Linux use `export DATABASE_URL=...` instead of `set`.

Keep this `DATABASE_URL` for the next step.

---

## 2. Backend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. Click **Add New** → **Project** and import your Git repo (this Practic repo).
3. **Important:** set **Root Directory** to `backend` (so Vercel only builds the API).
4. Leave **Framework Preset** as “Other” (or “Vercel” if you see it). Build and output are auto-detected.
5. Add **Environment Variables** in the Vercel project:

   | Name           | Value                                                                 |
   |----------------|-----------------------------------------------------------------------|
   | `DATABASE_URL` | Your Neon connection string from step 1                               |
   | `JWT_SECRET`   | A long random string (e.g. generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
   | `CORS_ORIGIN`  | Leave empty for now; set after you deploy the frontend (see below)    |
   | `OPENAI_API_KEY` | Your OpenAI API key (if the app uses it)                          |

6. Deploy. When it’s done, note the backend URL, e.g. `https://mini-learning-platform-backend-xxx.vercel.app`.

---

## 3. Frontend on Vercel

1. In Vercel, click **Add New** → **Project** again and import the **same** Git repo.
2. Set **Root Directory** to `frontend`.
3. Add one **Environment Variable**:

   | Name            | Value                    |
   |-----------------|--------------------------|
   | `VITE_API_URL`  | Your backend URL from step 2 (e.g. `https://mini-learning-platform-backend-xxx.vercel.app`) |

   No trailing slash.

4. Deploy. You’ll get a URL like `https://practic-frontend-xxx.vercel.app`.

---

## 4. Enable CORS (backend)

So the browser can call your API from the frontend URL:

1. Open your **backend** project on Vercel → **Settings** → **Environment Variables**.
2. Set **CORS_ORIGIN** to your **frontend** URL, e.g. `https://practic-frontend-xxx.vercel.app`.
3. Redeploy the backend (e.g. **Deployments** → … → **Redeploy**).

---

## 5. Done

- **Frontend:** open your frontend Vercel URL (e.g. `https://practic-frontend-xxx.vercel.app`).  
- **API:** your backend URL (e.g. `https://mini-learning-platform-backend-xxx.vercel.app/health`) should return `{"status":"ok"}`.

All of this stays within free tiers: Vercel (many projects) + Neon (free PostgreSQL).
