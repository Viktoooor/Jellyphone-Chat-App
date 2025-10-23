from pydantic import BaseModel, Field

class EditGroupReq(BaseModel):
    name: str = Field(default = None, min_length=1, max_length=32)
    membersToAdd: list[str]
    picture_id: str