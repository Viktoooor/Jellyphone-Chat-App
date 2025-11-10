from pydantic import BaseModel

class NotificationReq(BaseModel):
    sub: str