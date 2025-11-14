from uuid import UUID, uuid4
from bcrypt import gensalt, hashpw, checkpw
from fastapi import HTTPException, status, BackgroundTasks
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..dtos.userDTO import getUserDTOdump
from ..schemas.register import RegisterReq
from ..schemas.login import LoginReq
from ..models.user import User
from .tokenService import TokenService
from .mailService import MailService
from  ..s3 import s3_utils
import httpx
from config import settings
from jose import jwt
import re
import random
import secrets
import requests

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
    
    async def register(self, register_data: RegisterReq, background_tasks: BackgroundTasks):
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
        background_tasks.add_task(
            MailService.sendActivationMail,
            register_data.email, activationLink
        )
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

    def generate_oauth_redirect_uri():
        scope = "openid profile email"
        redirect_uri = (
            f"https://accounts.google.com/o/oauth2/v2/auth"
            f"?client_id={settings.OAUTH_CLIENT_ID}"
            f"&response_type=code"
            f"&redirect_uri={settings.CLIENT_URL}/login"
            f"&scope={scope}"
        )

        return redirect_uri
    
    async def google_auth(self, code: str):
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.OAUTH_CLIENT_ID,
                    "client_secret": settings.OAUTH_CLIENT_SECRET,
                    "redirect_uri": f'{settings.CLIENT_URL}/login',
                    "grant_type": "authorization_code"
                }
            )
        res_data = res.json()
        if "id_token" not in res_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bad request"
            )
        id_token = res_data['id_token']
        
        jwks = requests.get("https://www.googleapis.com/oauth2/v3/certs").json()
        user_data = jwt.decode(
            id_token, jwks, algorithms=["RS256"],
            audience=settings.OAUTH_CLIENT_ID,
            issuer=["https://accounts.google.com", "accounts.google.com"],
            options={"verify_at_hash": False}
        )

        if 'email_verified' not in user_data or user_data['email_verified'] is not True:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is not verified. Try using another account"
            )
        
        user_name = re.sub(
            r'[^a-z0-9_]', '_', user_data["email"].split('@')[0]
        )
        if len(user_name) > 32:
            user_name = user_name[:32]
        elif len(user_name) < 3:
            user_name = user_name + str(random.randint(100, 999))
        
        first_name = user_data["name"]
        if len(first_name) > 32:
            first_name = first_name[:32]
        
        isEmail = await self.isEmailUsed(user_data["email"])
        if isEmail is not True:
            salt = gensalt(10)
            bytes = secrets.token_bytes(32) # random password
            hash_bytes = hashpw(bytes, salt)
            hash = hash_bytes.decode('utf-8')

            password = hash
            
            user = User(
                email=user_data["email"],
                user_name=user_name,
                password=password,
                first_name=first_name,
                is_activated=True
            )

            self.session.add(user)
            await self.session.commit()

        user = await self.getUserByEmail(user_data["email"])
        token = TokenService.generateToken({"id": str(user.id)})

        await TokenService(self.session).saveToken(user.id, token)

        picture_url = s3_utils.generate_download_url(
            user.picture, "profilePictures", 3000
        )

        userDTO_dump = getUserDTOdump(user, picture_url)

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
        
        isUser = await self.isUserNameUsed(user_name)
        if isUser is True:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is used"
            )
        user.user_name = user_name

        user.first_name = first_name
        if picture_id:
            user.picture = picture_id
        if bio:
            user.bio = bio
        
        self.session.add(user)
        await self.session.commit()
        
        new_user = await self.getUserById(user_id)

        return new_user