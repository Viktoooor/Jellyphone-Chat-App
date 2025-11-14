from uuid import UUID
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from ..models.token import Token
from sqlalchemy.dialects.postgresql import insert
from sqlmodel import select
from config import settings
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError

class TokenService:
    def __init__(self, session: AsyncSession):
        self.session = session

    def generateToken(payload: dict):
        tokenPayload = payload.copy()
        tokenPayload.update({
            "exp": datetime.now(timezone.utc) + timedelta(days=30),
            "iat": datetime.now(timezone.utc)
        })

        refreshSecret = settings.JWT_SECRET

        token = jwt.encode(tokenPayload, refreshSecret, algorithm="HS256")

        return token
        
    def validateToken(token: str):
        try:
            user = jwt.decode(
                token, settings.JWT_SECRET, algorithms=["HS256"]
            )

            return user
        except ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    async def saveToken(self, user_id: UUID, token: str):
        tokenModel = Token(
            user_id=user_id, 
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=30)
        )
        
        query = insert(Token).values(tokenModel.model_dump())

        update_on_conflict = query.on_conflict_do_update(
            index_elements=['user_id'],
            set_={"token": token, "expires_at": tokenModel.expires_at}
        )

        await self.session.exec(update_on_conflict)
        await self.session.commit()

    # used in logout
    async def removeToken(self, user_id: UUID):
        query = select(Token).where(Token.user_id == user_id)

        res = await self.session.exec(query)
        token = res.first()
        
        if token:
            await self.session.delete(token)
            await self.session.commit()