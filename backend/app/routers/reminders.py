from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.reminder import ReminderPreference
from app.schemas.reminder import ReminderPreferenceUpdate, ReminderPreferenceResponse
from app.utils.security import get_current_user
from app.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/preferences", response_model=ReminderPreferenceResponse)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pref = (
        db.query(ReminderPreference)
        .filter(ReminderPreference.user_id == current_user.id)
        .first()
    )
    if not pref:
        # Create default if missing
        pref = ReminderPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


@router.patch("/preferences", response_model=ReminderPreferenceResponse)
def update_preferences(
    payload: ReminderPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pref = (
        db.query(ReminderPreference)
        .filter(ReminderPreference.user_id == current_user.id)
        .first()
    )
    if not pref:
        pref = ReminderPreference(user_id=current_user.id)
        db.add(pref)

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pref, key, value)

    db.commit()
    db.refresh(pref)
    return pref


@router.post("/send")
def send_reminders(db: Session = Depends(get_db)):
    """
    Called by cron-job.org twice daily.
    Sends reminder emails to users who have reminders enabled.
    """
    if not settings.resend_api_key:
        return {"message": "Email not configured, skipping"}

    try:
        import resend
        resend.api_key = settings.resend_api_key
    except ImportError:
        return {"message": "Resend not installed, skipping"}

    prefs = (
        db.query(ReminderPreference)
        .filter(ReminderPreference.is_enabled == True)
        .all()
    )

    sent = 0
    for pref in prefs:
        user = pref.user
        try:
            resend.Emails.send({
                "from": settings.from_email,
                "to": user.email,
                "subject": f"Dépense Reminder: Log your expenses!",
                "html": f"""
                <h2>Hey {user.name}!</h2>
                <p>Don't forget to log your expenses for today.</p>
                <p><a href="{settings.frontend_url}/add">Log Expense Now</a></p>
                <p>— Dépense</p>
                """,
            })
            sent += 1
        except Exception as e:
            print(f"Failed to send to {user.email}: {e}")

    return {"message": f"Sent {sent} reminders"}
