from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from typing import Optional
from datetime import date, timedelta
from app.database import get_db
from app.models.user import User
from app.models.expense import Expense
from app.utils.security import get_current_user

router = APIRouter()


@router.get("/summary")
def get_monthly_summary(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Monthly summary: total, daily average, top vendor, transaction count."""
    today = date.today()
    m = month or today.month
    y = year or today.year

    all_expenses = (
        db.query(Expense)
        .filter(
            Expense.user_id == current_user.id,
            extract("month", Expense.date) == m,
            extract("year", Expense.date) == y,
        )
        .all()
    )

    # Total includes everything (recurring + manual)
    total = sum(e.amount for e in all_expenses)
    count = len(all_expenses)

    # Non-recurring expenses only (for daily avg and top vendor)
    manual_expenses = [e for e in all_expenses if not e.is_recurring]

    # Days elapsed in the month (for daily avg)
    if m == today.month and y == today.year:
        days = today.day
    else:
        # Full month
        if m == 12:
            days = (date(y + 1, 1, 1) - date(y, m, 1)).days
        else:
            days = (date(y, m + 1, 1) - date(y, m, 1)).days

    manual_total = sum(e.amount for e in manual_expenses)
    daily_avg = round(manual_total / max(days, 1), 2)

    # Top vendor (non-recurring only)
    vendor_totals = {}
    for e in manual_expenses:
        vendor_totals[e.vendor] = vendor_totals.get(e.vendor, 0) + e.amount
    top_vendor = max(vendor_totals, key=vendor_totals.get) if vendor_totals else None
    top_vendor_amount = round(vendor_totals.get(top_vendor, 0), 2) if top_vendor else 0

    # Budget
    budget = current_user.monthly_budget
    budget_pct = round((total / budget) * 100, 1) if budget and budget > 0 else None

    return {
        "month": m,
        "year": y,
        "total": round(total, 2),
        "transaction_count": count,
        "daily_average": daily_avg,
        "top_vendor": top_vendor,
        "top_vendor_amount": top_vendor_amount,
        "budget": budget,
        "budget_percentage": budget_pct,
    }


@router.get("/by-vendor")
def get_expenses_by_vendor(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Group expenses by vendor for the given month — powers the pie chart."""
    today = date.today()
    m = month or today.month
    y = year or today.year

    results = (
        db.query(Expense.vendor, func.sum(Expense.amount).label("total"))
        .filter(
            Expense.user_id == current_user.id,
            extract("month", Expense.date) == m,
            extract("year", Expense.date) == y,
            Expense.is_recurring == False,
        )
        .group_by(Expense.vendor)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )

    return [{"vendor": r.vendor, "total": round(r.total, 2)} for r in results]


@router.get("/by-payment-method")
def get_expenses_by_payment_method(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Group expenses by payment method."""
    today = date.today()
    m = month or today.month
    y = year or today.year

    results = (
        db.query(Expense.payment_method, func.sum(Expense.amount).label("total"))
        .filter(
            Expense.user_id == current_user.id,
            extract("month", Expense.date) == m,
            extract("year", Expense.date) == y,
        )
        .group_by(Expense.payment_method)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )

    return [{"method": r.payment_method, "total": round(r.total, 2)} for r in results]


@router.get("/monthly-trend")
def get_monthly_trend(
    year: Optional[int] = Query(None, ge=2020),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Monthly totals for the year — powers the bar chart."""
    y = year or date.today().year

    results = (
        db.query(
            extract("month", Expense.date).label("month"),
            func.sum(Expense.amount).label("total"),
        )
        .filter(
            Expense.user_id == current_user.id,
            extract("year", Expense.date) == y,
        )
        .group_by(extract("month", Expense.date))
        .order_by(extract("month", Expense.date))
        .all()
    )

    # Fill all 12 months (0 for missing)
    month_map = {int(r.month): round(r.total, 2) for r in results}
    months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]
    return [
        {"month": months[i], "month_num": i + 1, "total": month_map.get(i + 1, 0)}
        for i in range(12)
    ]


@router.get("/yearly-summary")
def get_yearly_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Yearly totals across all years."""
    results = (
        db.query(
            extract("year", Expense.date).label("year"),
            func.sum(Expense.amount).label("total"),
            func.count(Expense.id).label("count"),
        )
        .filter(Expense.user_id == current_user.id)
        .group_by(extract("year", Expense.date))
        .order_by(extract("year", Expense.date).desc())
        .all()
    )

    return [
        {"year": int(r.year), "total": round(r.total, 2), "count": r.count}
        for r in results
    ]


@router.get("/streak")
def get_logging_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Calculate consecutive days the user has logged at least one expense."""
    today = date.today()

    # Get distinct dates with expenses, ordered descending
    dates = (
        db.query(Expense.date)
        .filter(Expense.user_id == current_user.id)
        .distinct()
        .order_by(Expense.date.desc())
        .all()
    )

    if not dates:
        return {"current_streak": 0, "longest_streak": 0}

    date_set = {d[0] for d in dates}

    # Current streak: count back from today (or yesterday if not logged today yet)
    current_streak = 0
    check = today
    if check not in date_set:
        check = today - timedelta(days=1)
    while check in date_set:
        current_streak += 1
        check -= timedelta(days=1)

    # Longest streak
    sorted_dates = sorted(date_set)
    longest = 1
    run = 1
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
            run += 1
            longest = max(longest, run)
        else:
            run = 1

    return {"current_streak": current_streak, "longest_streak": longest}


@router.get("/month-comparison")
def get_month_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Compare current month with previous month."""
    today = date.today()
    curr_month = today.month
    curr_year = today.year
    prev_month = curr_month - 1 if curr_month > 1 else 12
    prev_year = curr_year if curr_month > 1 else curr_year - 1

    def month_total(m, y):
        result = (
            db.query(func.sum(Expense.amount))
            .filter(
                Expense.user_id == current_user.id,
                extract("month", Expense.date) == m,
                extract("year", Expense.date) == y,
            )
            .scalar()
        )
        return round(result or 0, 2)

    curr_total = month_total(curr_month, curr_year)
    prev_total = month_total(prev_month, prev_year)
    change_pct = (
        round(((curr_total - prev_total) / prev_total) * 100, 1)
        if prev_total > 0
        else None
    )

    return {
        "current_month": curr_month,
        "current_year": curr_year,
        "current_total": curr_total,
        "previous_month": prev_month,
        "previous_year": prev_year,
        "previous_total": prev_total,
        "change_percentage": change_pct,
    }
