from typing import Annotated
from fastapi import Cookie, HTTPException, status
from uuid import UUID
from ..services.tokenService import TokenService

def auth_middleware(token: Annotated[str, Cookie()]):
    try:
        if token is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        user = TokenService.validateToken(token)

        return UUID(user['id'])
    except HTTPException as e: 
        raise e