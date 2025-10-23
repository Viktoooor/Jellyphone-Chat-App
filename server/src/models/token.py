import datetime
from sqlmodel import SQLModel, Field
from uuid import UUID
from sqlalchemy import Column, DateTime, text

class Token(SQLModel, table = True):
    __tablename__ = 'tokens'

    user_id: UUID = Field(foreign_key="users.id", primary_key=True)
    token: str = Field(nullable=False)
    expires_at: datetime.datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("CURRENT_TIMESTAMP + INTERVAL '30 days'")
        )
    )