from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.schemas.expense import PaymentMethod


class RecurringExpenseCreate(BaseModel):
    amount: float
    vendor: str
    payment_method: PaymentMethod
    day_of_month: int
    note: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return round(v, 2)

    @field_validator("day_of_month")
    @classmethod
    def day_must_be_valid(cls, v):
        if v < 1 or v > 31:
            raise ValueError("Day of month must be between 1 and 31")
        return v

    @field_validator("vendor")
    @classmethod
    def vendor_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("Vendor cannot be empty")
        return v.strip().title()


class RecurringExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    vendor: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
    day_of_month: Optional[int] = None
    note: Optional[str] = None
    is_active: Optional[bool] = None


class RecurringExpenseResponse(BaseModel):
    id: UUID
    amount: float
    vendor: str
    payment_method: str
    day_of_month: int
    note: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
