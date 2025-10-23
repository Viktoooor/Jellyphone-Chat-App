import datetime
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import DateTime, text
import sqlalchemy.dialects.postgresql as pg
from uuid import UUID, uuid4

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True, unique=True, default=uuid4)
    )
    chat_id: UUID = Field(nullable=False)
    message: bytes = Field(nullable=False)
    send_time: datetime.datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("CURRENT_TIMESTAMP")
        )
    )
    meta: dict = Field(sa_type=pg.JSONB, nullable=False)