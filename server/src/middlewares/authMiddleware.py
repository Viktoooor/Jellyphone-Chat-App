from typing import Annotated
from fastapi import Cookie, HTTPException
from uuid import UUID
from ..services.tokenService import TokenService

def auth_middleware(token: Annotated[str, Cookie()]):
    try:
        user = TokenService.validateToken(token)

        return UUID(user['id'])
    except HTTPException as e: 
        raise e