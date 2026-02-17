# Deploying Practic (frontend + backend)

Use **Render** for the backend + database and **Vercel** for the frontend. Both have free tiers.

---

## Part 1: Backend + database on Render

1. **Sign up** at [render.com](https://render.com) (GitHub login is easiest).

2. **Create a PostgreSQL database**
   - Dashboard → **New +** → **PostgreSQL**.
   - Name it (e.g. `practic-db`).
   - Region: pick one close to you.
   - Create. Copy the **Internal Database URL** (you’ll use it in the next step).

3. **Create a Web Service for the backend**
   - **New +** → **Web Service**.
   - Connect your GitHub repo and select the **Practic** repo.
   - Configure:
     - **Name:** `practic-api` (or any name).
     - **Root Directory:** `backend`.
     - **Runtime:** Node.
     - **Build command:** `npm install && npx prisma generate && npm run build`
     - **Start command:** `npx prisma migrate deploy && npm start`
   - **Environment variables** (Add all of these):

     | Key             | Value |
     |-----------------|--------|
     | `NODE_ENV`      | `production` |
     | `DATABASE_URL`  | *(paste the Internal Database URL from step 2)* |
     | `JWT_SECRET`    | *(generate a long random string, e.g. use [randomkeygen](https://randomkeygen.com/))* |
     | `JWT_EXPIRES_IN`| `7d` |
     | `OPENAI_API_KEY`| *(your OpenAI API key if you use AI features)* |

   - After you have your frontend URL (from Part 2), add:
     | Key           | Value |
     |---------------|--------|
     | `CORS_ORIGIN` | `https://your-app.vercel.app` *(your real Vercel URL)* |

   - Click **Create Web Service**. Wait for the first deploy to finish.

4. **Get your backend URL**
   - On the service page you’ll see something like: `https://practic-api.onrender.com`. Copy it — you need it for the frontend.

---

## Part 2: Frontend on Vercel

1. **Sign up** at [vercel.com](https://vercel.com) and connect your GitHub account.

2. **Import the project**
   - **Add New** → **Project** → select your **Practic** repo.

3. **Configure the frontend**
   - **Root Directory:** click **Edit**, set to `frontend`.
   - **Framework Preset:** Vite (should be auto-detected).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment variable:**
     - Name: `VITE_API_URL`
     - Value: `https://practic-api.onrender.com` *(use your real Render URL from Part 1)*
   - Click **Deploy**.

4. **Get your frontend URL**
   - When the deploy finishes, Vercel gives you a URL like `https://practic-xxx.vercel.app`. Copy it.

5. **Allow that URL in the backend (CORS)**
   - In Render: open your **practic-api** Web Service → **Environment**.
   - Add (or update):
     - `CORS_ORIGIN` = `https://practic-xxx.vercel.app` *(your real Vercel URL)*
   - Save. Render will redeploy; wait for it to finish.

---

## Summary

| What        | Where   | URL you get |
|------------|---------|-------------|
| Backend + DB | Render | `https://your-api.onrender.com` |
| Frontend   | Vercel  | `https://your-app.vercel.app` |

- **Frontend** uses `VITE_API_URL` so all API calls go to your Render backend.
- **Backend** uses `CORS_ORIGIN` so only your Vercel site can call the API.

---

## Optional: run database seed on Render

If you have a seed script and want to run it once on production:

- In Render, open your Web Service → **Shell** (or use a one-off job if available).
- Run: `npx prisma db seed`

Or add a **Background Worker** on Render that runs the seed once, then you can delete the worker.

---

## Troubleshooting

- **Frontend can’t reach API:** Check `VITE_API_URL` on Vercel and that the backend URL is correct. Rebuild the frontend after changing env vars.
- **CORS errors:** Make sure `CORS_ORIGIN` on Render exactly matches your Vercel URL (including `https://`, no trailing slash).
- **Database errors:** Ensure `DATABASE_URL` on Render is the **Internal** URL if the DB and Web Service are in the same account (Render recommends internal for that).
