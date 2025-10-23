from pydantic import BaseModel, Field

class CreateGroupReq(BaseModel):
    name: str = Field(default = None, min_length=1, max_length=32)
    members: list[str]
    picture_id: str