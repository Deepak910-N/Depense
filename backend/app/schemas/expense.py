from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from enum import Enum


class PaymentMethod(str, Enum):
    cash = "cash"
    gpay = "gpay"
    credit_card = "credit_card"


class ExpenseCreate(BaseModel):
    amount: float
    vendor: str
    payment_method: PaymentMethod
    date: date
    note: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return round(v, 2)

    @field_validator("vendor")
    @classmethod
    def vendor_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("Vendor cannot be empty")
        return v.strip().title()  # Normalize: "swiggy" → "Swiggy"


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    vendor: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
    date: Optional[date] = None
    note: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: UUID
    amount: float
    vendor: str
    payment_method: str
    date: date
    note: Optional[str] = None
    is_recurring: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseFilters(BaseModel):
    month: Optional[int] = None      # 1-12
    year: Optional[int] = None
    vendor: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
