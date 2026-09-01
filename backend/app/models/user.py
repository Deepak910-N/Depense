import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    monthly_budget = Column(Float, nullable=True, default=None)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    recurring_expenses = relationship(
        "RecurringExpense", back_populates="user", cascade="all, delete-orphan"
    )
    reminder_preference = relationship(
        "ReminderPreference", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
