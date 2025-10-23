from sqlmodel import SQLModel, Field, Column
import sqlalchemy.dialects.postgresql as pg
from uuid import UUID, uuid4

class Chat(SQLModel, table=True):
    __tablename__ = "chats"

    chat_id: UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True, unique=True, default=uuid4)
    )
    type: str = Field(nullable=False)
    info: dict | None = Field(sa_type=pg.JSONB)