from pydantic import BaseModel

class RemoveMemberReq(BaseModel):
    chat_id: str
    member_id: str