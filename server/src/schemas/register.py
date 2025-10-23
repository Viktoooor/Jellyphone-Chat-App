from pydantic import BaseModel, EmailStr, Field, StringConstraints
from typing import Annotated

Username = Annotated[str, StringConstraints(pattern=r'^[a-z0-9_]{3,32}$')]

class RegisterReq(BaseModel):
    email: EmailStr
    user_name: Username
    first_name: str = Field(min_length=1, max_length=32)
    password: str