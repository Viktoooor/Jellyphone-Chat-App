# CURRENTLY IN user.py SINCE IT WASN'T WORKING


# from sqlmodel import SQLModel
# from uuid import UUID
# from pydantic import Field

# class ContactRequest(SQLModel, table=True):
#     __tablename__ = "contact_requests"

#     sender_od: UUID = Field(foreign_key="user.id", primary_key=True)
#     contact_id: UUID = Field(foreign_key="user.id", primary_key=True)