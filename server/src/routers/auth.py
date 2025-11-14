from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Body
from ..schemas.register import RegisterReq
from ..services.userService import UserService
from sqlmodel.ext.asyncio.session import AsyncSession
from ..db.main import get_session
from ..schemas.login import LoginReq
from fastapi.responses import JSONResponse
from fastapi.responses import RedirectResponse
from typing import Annotated

router = APIRouter(prefix="/api/auth")

@router.get("/checkUserName/{user_name}")
async def checkUserName(user_name: str, session: AsyncSession = Depends(get_session)):
    res = await UserService(session).isUserNameUsed(user_name)

    if res:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Username is occupied"}
        )
    return JSONResponse(
        content={"message": "Username is free"},
        status_code=status.HTTP_200_OK
    )

@router.get("/checkUserEmail/{email}")
async def checkUserEmail(email:str, session: AsyncSession = Depends(get_session)):
    res = await UserService(session).isEmailUsed(email)

    if res:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "User with this email is already registered"}
        )
    return JSONResponse(
        content={"message": "Email is free"},
        status_code=status.HTTP_200_OK
    )

@router.post("/register", status_code=201)
async def registration(req: RegisterReq, background_tasks: BackgroundTasks,
                       session: AsyncSession = Depends(get_session)):
    try:
        await UserService(session).register(req, background_tasks)

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "message": '''User successfuly created.
                    Now activate your account via email link'''
            }
        )
    except HTTPException as e:
        return JSONResponse(
            content={"message": e.detail},
            status_code=e.status_code
        )

@router.get("/activate/{link}")
async def activate(link: str, session: AsyncSession = Depends(get_session)):
    try:
        await UserService(session).activate(link)

        return JSONResponse(
            content={"message": "Success"},
            status_code=status.HTTP_200_OK
        )
    except HTTPException as e:
        return JSONResponse(
            content={"message": e.detail},
            status_code=e.status_code
        )

@router.post("/login")
async def login(req: LoginReq, session: AsyncSession = Depends(get_session)):
    try:
        userData = await UserService(session).login(req)
        
        res = JSONResponse(
            status_code=status.HTTP_200_OK,
            content=userData
        )
        res.set_cookie(
            key='token', 
            value=userData['token'], 
            httponly=True,
            samesite='strict', # IMPORTANT
            secure=False, # set to True in https
            max_age=30*24*60*60
        )
        
        return res
    except HTTPException as e:
        return JSONResponse(
            content={"message": e.detail},
            status_code=e.status_code
        )

@router.get("/google/url")
def get_google_uri():
    redirect_uri = UserService.generate_oauth_redirect_uri()
    
    return RedirectResponse(url=redirect_uri, status_code=302)

@router.post("/google/login")
async def google_auth(code: Annotated[str, Body(embed=True)],
                      session: AsyncSession = Depends(get_session)):
    try:
        userData = await UserService(session).google_auth(code)

        res = JSONResponse(
            status_code=status.HTTP_200_OK,
            content=userData
        )
        res.set_cookie(
            key='token', 
            value=userData['token'], 
            httponly=True,
            samesite='strict', # IMPORTANT
            secure=False, # set to True in https
            max_age=30*24*60*60
        )
        
        return res
    except HTTPException as e:
        return JSONResponse(
            content={"message": e.detail},
            status_code=e.status_code
        )