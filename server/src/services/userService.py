from uuid import UUID, uuid4
from bcrypt import gensalt, hashpw, checkpw
from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..dtos.userDTO import getUserDTOdump
from ..schemas.register import RegisterReq
from ..schemas.login import LoginReq
from ..models.user import User
from .tokenService import TokenService
from .mailService import MailService
from  ..s3 import s3_utils

class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def isEmailUsed(self, email: str) -> bool:
        query = select(User.id).where(User.email == email)

        res = await self.session.exec(query)
        user_id = res.first()

        return user_id is not None
    
    async def isUserNameUsed(self, user_name: str) -> bool:
        query = select(User.id).where(User.user_name == user_name)

        res = await self.session.exec(query)
        user_id = res.first()

        return user_id is not None

    async def getUserById(self, id: UUID):
        query = select(
            User.id, User.password, User.user_name,
            User.first_name, User.picture, User.bio
        ).where(User.id == id)

        res = await self.session.exec(query)
        user = res.first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No user with this id was found!"
            )
        
        picture_url = s3_utils.generate_download_url(
            user.picture, "profilePictures", 3000
        )

        userDTO_dump = getUserDTOdump(user, picture_url)

        return userDTO_dump
    
    async def getNameById(self, id: UUID):
        query = select(User.first_name).where(User.id == id)

        res = await self.session.exec(query)
        name = res.first()

        return name
     
    async def getUserByEmail(self, email: str):
        query = select(
            User.id, User.email, User.password, User.user_name,
            User.first_name, User.picture, User.bio, User.is_activated
        ).where(User.email == email)

        res = await self.session.exec(query)
        user = res.first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No user with this email was found!"
            )

        return user
    
    async def register(self, register_data: RegisterReq):
        isUsed = await self.isEmailUsed(register_data.email)
        if isUsed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "User with this email is already registered"}
            )
        
        isUsed = await self.isUserNameUsed(register_data.user_name)
        if isUsed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Username is occupied"}
            )
        
        salt = gensalt(10)
        bytes = register_data.password.encode('utf-8')
        hash_bytes = hashpw(bytes, salt)
        hash = hash_bytes.decode('utf-8')

        activationLink = str(uuid4())
        MailService.sendActivationMail(register_data.email, activationLink)
        
        register_data.password = hash
        
        user = User(**register_data.model_dump(), activation_link=activationLink)

        self.session.add(user)
        await self.session.commit()
    
    async def activate(self, link: str):
        query = select(User).where(User.activation_link == link)

        res = await self.session.exec(query)
        user = res.first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid link"
            )
        
        user.is_activated = True
        self.session.add(user)
        await self.session.commit()

    async def login(self, login_data: LoginReq):
        candidate = await self.getUserByEmail(login_data.email)

        if candidate.is_activated == False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='''Account with this email is not activated.
                Activate it via link in email!'''
            )
        
        password = login_data.password.encode('utf-8')
        hash_password = candidate.password.encode('utf-8')
        
        if not checkpw(password, hash_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password"
            )

        token = TokenService.generateToken({"id": str(candidate.id)})

        await TokenService(self.session).saveToken(candidate.id, token)

        picture_url = s3_utils.generate_download_url(
            candidate.picture, "profilePictures", 3000
        )

        userDTO_dump = getUserDTOdump(candidate, picture_url)

        return {"token": token, "user": userDTO_dump}
    
    async def changeInfo(self, user_id: UUID, first_name: str, user_name: str,
                         bio: str | None, picture_id: str | None):
        query = select(User).where(User.id == user_id)

        res = await self.session.exec(query)
        user = res.first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unexpected error"
            )
        
        user.first_name = first_name
        user.user_name = user_name
        if picture_id:
            user.picture = picture_id
        if bio:
            user.bio = bio
        
        self.session.add(user)
        await self.session.commit()
        
        new_user = await self.getUserById(user_id)

        return new_user