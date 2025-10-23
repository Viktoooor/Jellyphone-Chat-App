from pydantic import BaseModel

class UserDTO(BaseModel):
    id: str
    user_name: str
    first_name: str
    picture: str | None
    bio: str | None

def getUserDTOdump(user, picture_url):
    userDTO = UserDTO(
        id=str(user.id),
        user_name=user.user_name,
        first_name=user.first_name,
        picture=picture_url,
        bio=user.bio
    )

    userDTO_dump = userDTO.model_dump()

    return userDTO_dump