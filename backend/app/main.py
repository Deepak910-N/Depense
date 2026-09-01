from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from app.config import get_settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, expenses, recurring, dashboard, reminders

settings = get_settings()

Base.metadata.create_all(bind=engine)


def run_recurring_job():
    db = SessionLocal()
    try:
        from app.routers.recurring import process_recurring_expenses
        process_recurring_expenses(db=db)
    except Exception as e:
        print(f"Recurring job error: {e}")
    finally:
        db.close()


def run_reminders_job():
    from datetime import datetime
    import pytz
    db = SessionLocal()
    try:
        now = datetime.now(pytz.timezone("Asia/Kolkata")).strftime("%H:%M")
        from app.models.reminder import ReminderPreference
        from app.models.user import User
        import resend
        resend.api_key = settings.resend_api_key

        prefs = (
            db.query(ReminderPreference)
            .filter(
                ReminderPreference.is_enabled == True,
            )
            .all()
        )
        sent = 0
        for pref in prefs:
            t1 = pref.reminder_time_1.strftime("%H:%M") if pref.reminder_time_1 else None
            t2 = pref.reminder_time_2.strftime("%H:%M") if pref.reminder_time_2 else None
            if now not in (t1, t2):
                continue
            user = pref.user
            try:
                resend.Emails.send({
                    "from": settings.from_email,
                    "to": user.email,
                    "subject": "Dépense: Don't forget to log your expenses!",
                    "html": f"""
                    <h2>Hey {user.name}!</h2>
                    <p>Don't forget to log your expenses for today.</p>
                    <p><a href="{settings.frontend_url}/add">Log Expense Now</a></p>
                    <p>— Dépense</p>
                    """,
                })
                sent += 1
            except Exception as e:
                print(f"Failed to send reminder to {user.email}: {e}")
        if sent:
            print(f"Sent {sent} reminder(s) at {now} IST")
    except Exception as e:
        print(f"Reminders job error: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler(timezone="Asia/Kolkata")
    scheduler.add_job(run_recurring_job, "cron", hour=0, minute=5)
    scheduler.add_job(run_reminders_job, "interval", minutes=1)
    scheduler.start()
    print("Scheduler started: recurring@00:05 IST, reminders polling every minute")
    yield
    scheduler.shutdown()


app = FastAPI(
    title=settings.app_name,
    description="Personal expense tracker for you and your friends",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])
app.include_router(recurring.router, prefix="/api/recurring", tags=["Recurring"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(reminders.router, prefix="/api/reminders", tags=["Reminders"])


@app.get("/")
def root():
    return {"app": settings.app_name, "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
