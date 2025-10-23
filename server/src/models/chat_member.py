from sqlmodel import SQLModel, Field
from uuid import UUID

class ChatMember(SQLModel, table=True):
    __tablename__ = "chat_members"

    user_id: UUID = Field(nullable=False, primary_key=True)
    chat_id: UUID = Field(nullable=False, primary_key=True)
    role: str = Field(default='member', nullable=False)