from sqlmodel import SQLModel, Field
from uuid import UUID
from sqlalchemy.dialects.postgresql import JSONB

class NotificationSub(SQLModel, table=True):
    __tablename__ = "notification_subs"

    id: UUID = Field(nullable=False, primary_key=True)
    user_id: UUID = Field(nullable=False, primary_key=True)
    sub: dict = Field(sa_type=JSONB, nullable=False)