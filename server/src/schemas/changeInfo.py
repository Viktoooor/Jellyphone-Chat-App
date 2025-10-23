from pydantic import BaseModel, Field

class ChangeInfoReq(BaseModel):
    first_name: str = Field(default = None, min_length=1, max_length=32)
    user_name: str = Field(default = None, min_length=3, max_length=32)
    bio: str | None = Field(default = None)
    picture_id: str | None = Field(default = None)