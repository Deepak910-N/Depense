from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.expense import Expense
from app.models.recurring import RecurringExpense
from app.schemas.recurring import RecurringExpenseCreate, RecurringExpenseUpdate, RecurringExpenseResponse
from app.utils.security import get_current_user

router = APIRouter()


@router.post("/", response_model=RecurringExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_recurring(
    payload: RecurringExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recurring = RecurringExpense(
        user_id=current_user.id,
        amount=payload.amount,
        vendor=payload.vendor,
        payment_method=payload.payment_method.value,
        day_of_month=payload.day_of_month,
        note=payload.note,
    )
    db.add(recurring)
    db.flush()  # get the recurring.id before commit

    # If the recurring day has already passed (or is today) this month,
    # auto-create this month's expense so it counts immediately.
    today = date.today()
    if payload.day_of_month <= today.day:
        # Build the actual expense date for this month
        try:
            expense_date = date(today.year, today.month, payload.day_of_month)
        except ValueError:
            # day_of_month exceeds this month's days (e.g. 31 in Feb) — use last day
            import calendar
            last_day = calendar.monthrange(today.year, today.month)[1]
            expense_date = date(today.year, today.month, last_day)

        # Check idempotency — don't duplicate if already exists
        existing = (
            db.query(Expense)
            .filter(
                Expense.user_id == current_user.id,
                Expense.vendor == payload.vendor,
                Expense.amount == payload.amount,
                Expense.date == expense_date,
                Expense.is_recurring == True,
            )
            .first()
        )
        if not existing:
            expense = Expense(
                user_id=current_user.id,
                amount=payload.amount,
                vendor=payload.vendor,
                payment_method=payload.payment_method.value,
                date=expense_date,
                note=payload.note or "Auto-logged recurring expense",
                is_recurring=True,
            )
            db.add(expense)

    db.commit()
    db.refresh(recurring)
    return recurring


@router.get("/", response_model=List[RecurringExpenseResponse])
def list_recurring(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(RecurringExpense)
        .filter(RecurringExpense.user_id == current_user.id)
        .order_by(RecurringExpense.day_of_month)
        .all()
    )


@router.patch("/{recurring_id}", response_model=RecurringExpenseResponse)
def update_recurring(
    recurring_id: UUID,
    payload: RecurringExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recurring = (
        db.query(RecurringExpense)
        .filter(RecurringExpense.id == recurring_id, RecurringExpense.user_id == current_user.id)
        .first()
    )
    if not recurring:
        raise HTTPException(status_code=404, detail="Recurring expense not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "payment_method" in update_data and update_data["payment_method"]:
        update_data["payment_method"] = update_data["payment_method"].value
    if "vendor" in update_data and update_data["vendor"]:
        update_data["vendor"] = update_data["vendor"].strip().title()

    for key, value in update_data.items():
        setattr(recurring, key, value)

    db.commit()
    db.refresh(recurring)
    return recurring


@router.delete("/{recurring_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurring(
    recurring_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recurring = (
        db.query(RecurringExpense)
        .filter(RecurringExpense.id == recurring_id, RecurringExpense.user_id == current_user.id)
        .first()
    )
    if not recurring:
        raise HTTPException(status_code=404, detail="Recurring expense not found")
    db.delete(recurring)
    db.commit()


@router.post("/process", status_code=status.HTTP_200_OK)
def process_recurring_expenses(db: Session = Depends(get_db)):
    """
    Called by cron job daily. Checks if today's day-of-month matches any
    active recurring expenses, and auto-creates them.
    """
    today = date.today()
    recurring_list = (
        db.query(RecurringExpense)
        .filter(
            RecurringExpense.is_active == True,
            RecurringExpense.day_of_month == today.day,
        )
        .all()
    )

    created = 0
    for rec in recurring_list:
        # Check if already created today (idempotency)
        existing = (
            db.query(Expense)
            .filter(
                Expense.user_id == rec.user_id,
                Expense.vendor == rec.vendor,
                Expense.amount == rec.amount,
                Expense.date == today,
                Expense.is_recurring == True,
            )
            .first()
        )
        if not existing:
            expense = Expense(
                user_id=rec.user_id,
                amount=rec.amount,
                vendor=rec.vendor,
                payment_method=rec.payment_method,
                date=today,
                note=rec.note or "Auto-logged recurring expense",
                is_recurring=True,
            )
            db.add(expense)
            created += 1

    db.commit()
    return {"message": f"Processed {created} recurring expenses for {today}"}
