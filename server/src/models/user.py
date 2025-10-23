from sqlmodel import SQLModel, Field, Column
import sqlalchemy.dialects.postgresql as pg
from uuid import UUID, uuid4
#from ..models.contact import Contact

class Contact(SQLModel, table=True):
    __tablename__ = "contacts" 

    user_id: UUID = Field(foreign_key="users.id", primary_key=True)
    contact_id: UUID = Field(foreign_key="users.id", primary_key=True)
    chat_id: UUID = Field(nullable=False)

class ContactRequest(SQLModel, table=True):
    __tablename__ = "contact_requests"

    sender_id: UUID = Field(foreign_key="users.id", primary_key=True)
    accepter_id: UUID = Field(foreign_key="users.id", primary_key=True)
    blocked: bool

class User(SQLModel, table = True):
    __tablename__ = "users"
    id: UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True, unique=True, default=uuid4)
    )
    email: str = Field(unique=True, nullable=False)
    user_name: str = Field(unique=True, nullable=False)
    password: str = Field(nullable=False)
    first_name: str = Field(nullable=False)
    is_activated: bool = Field(default=False)
    activation_link: str = Field(nullable=False)
    bio: str = Field(default="")
    picture: str = Field(default="default.png")