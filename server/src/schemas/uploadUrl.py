from pydantic import BaseModel
from enum import Enum

class RequestType(str, Enum):
    GROUP = 'groupPictures'
    PROFILE = 'profilePictures'
    CHAT = 'chatPictures'

class FileMeta(BaseModel):
    client_id: str
    type: str
    size: int

class UploadUrlReq(BaseModel):
    request_type: RequestType
    files: list[FileMeta]