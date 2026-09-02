# Dépense — Personal Expense Tracker

A full-stack expense tracker for you and your friends. Track daily expenses, auto-log recurring payments, view spending charts, and stay on top of your budget — all for free.

## Tech Stack

| Layer | Tech | Hosted On |
|-------|------|-----------|
| Frontend | React + Vite + Tailwind CSS + Recharts | Vercel (free) |
| Backend | Python FastAPI + SQLAlchemy | Render (free) |
| Database | PostgreSQL | Supabase (free) |
| Reminders | cron-job.org + Resend | Free tiers |

## Features

- Manual expense entry with date, amount, vendor, payment method
- Vendor auto-suggest (learns from your history)
- Recurring expense auto-logging (rent, subscriptions, EMIs)
- Dashboard with pie charts (by vendor), bar charts (monthly trend)
- Monthly budget tracking with progress bar and alerts
- Month-over-month comparison
- Logging streak gamification
- Daily email reminders (2x/day)
- Multi-user support (each user tracks individually)

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL database (Supabase free tier recommended)

### Backend Setup
```bash
cd backend
cp env.template .env           # Edit with your DB URL and secrets
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
cp env.template .env           # Set VITE_API_URL
npm install
npm run dev
```

### Deployment

**Backend (Render):**
1. Push repo to GitHub
2. Connect to Render, select the `backend/` directory
3. Set environment variables from `env.template`

**Frontend (Vercel):**
1. Import repo on Vercel, set root to `frontend/`
2. Set `VITE_API_URL` to your Render backend URL

**Database (Supabase):**
1. Create a free project at supabase.com
2. Copy the PostgreSQL connection string to `DATABASE_URL`

**Reminders (cron-job.org):**
1. Create two cron jobs hitting `POST <backend-url>/api/reminders/send`
2. Schedule at 9:00 AM and 8:00 PM IST

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PATCH | /api/auth/me | Update profile/budget |
| POST | /api/expenses/ | Add expense |
| GET | /api/expenses/ | List expenses (filterable) |
| GET | /api/expenses/vendors?q= | Vendor auto-suggest |
| PATCH | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| POST | /api/recurring/ | Add recurring expense |
| GET | /api/recurring/ | List recurring expenses |
| POST | /api/recurring/process | Process daily recurring (cron) |
| GET | /api/dashboard/summary | Monthly summary KPIs |
| GET | /api/dashboard/by-vendor | Expenses grouped by vendor |
| GET | /api/dashboard/monthly-trend | 12-month spending trend |
| GET | /api/dashboard/yearly-summary | Year-over-year totals |
| GET | /api/dashboard/streak | Logging streak |
| GET | /api/dashboard/month-comparison | vs last month |

## License
MIT Expense Tracker

A lightweight expense tracker for you and your friends. Log daily expenses, track monthly/yearly spending, visualize trends, and build a logging streak.

## Features

- **Daily Expense Logging** — Manual form entry with date, amount, vendor, payment method
- **Vendor Grouping** — Expenses auto-grouped by vendor with smart auto-suggest
- **Monthly & Yearly Tracking** — Visual dashboards with charts and summaries
- **Recurring Expenses** — Auto-log rent, subscriptions, EMIs on set dates
- **Budget Alerts** — Set monthly budgets, get warnings at 80% and 100%
- **Logging Streak** — Gamified daily streak counter to build the habit
- **Daily Reminders** — Two email reminders per day (configurable times)
- **Month-over-Month Comparison** — See spending trends across months
- **Multi-User** — Up to 10 users, each with their own private data

## Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React + Vite + Tailwind CSS + Recharts | Vercel (free) |
| Backend | Python FastAPI + SQLAlchemy | Render (free) |
| Database | PostgreSQL | Supabase (free) |
| Email | Resend | Free tier |
| Cron | cron-job.org | Free |

## Getting Started

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Fill in your values
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env  # Set VITE_API_URL
npm run dev
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required config.

## Deployment

- **Frontend**: Connect GitHub repo to Vercel, set root directory to `frontend/`
- **Backend**: Connect GitHub repo to Render, set root directory to `backend/`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Database**: Create a free Supabase project, copy the PostgreSQL connection string
- **Reminders**: Set up two cron jobs on cron-job.org pointing to `POST /api/reminders/send`

## License

MIT
