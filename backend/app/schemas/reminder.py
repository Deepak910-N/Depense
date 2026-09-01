from pydantic import BaseModel
from typing import Optional
from datetime import time


class ReminderPreferenceUpdate(BaseModel):
    reminder_time_1: Optional[time] = None
    reminder_time_2: Optional[time] = None
    is_enabled: Optional[bool] = None


class ReminderPreferenceResponse(BaseModel):
    reminder_time_1: time
    reminder_time_2: time
    is_enabled: bool

    class Config:
        from_attributes = True
