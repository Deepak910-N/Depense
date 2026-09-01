import uuid
from datetime import time
from sqlalchemy import Column, String, Boolean, Time, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class ReminderPreference(Base):
    __tablename__ = "reminder_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    reminder_time_1 = Column(Time, default=time(9, 0))   # 9:00 AM
    reminder_time_2 = Column(Time, default=time(20, 0))   # 8:00 PM
    is_enabled = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="reminder_preference")
