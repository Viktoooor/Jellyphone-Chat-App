from pydantic import BaseModel, model_validator, ConfigDict

class MessageMeta(BaseModel):
    model_config = ConfigDict(extra="forbid")

    read: bool = False
    sender_id: str
    reply_id: str | None = None
    file_id: str | None = None
    file_type: str | None = None
    file_size: int | None = None
    width: float | None = None
    height: float | None = None

    @model_validator(mode='after')
    def check_file_consistency(self):
        if self.file_id and (not self.file_type or not self.file_size):
            raise ValueError("File type and size must be set")
        return self
