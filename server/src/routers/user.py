from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse 
from ..db.main import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from ..services.tokenService import TokenService
from ..schemas.changeInfo import ChangeInfoReq
from ..schemas.notificationSub import NotificationReq
from ..services.userService import UserService
from ..middlewares.authMiddleware import auth_middleware
from ..services.contactService import ContactService
from ..schemas.uploadUrl import UploadUrlReq
from ..services.fileService import FileService
from ..services.notificationService import NotificationService

router = APIRouter(prefix="/api/user")

@router.get('/me')
async def getUser(user_id: UUID = Depends(auth_middleware),
                  session: AsyncSession = Depends(get_session)):
    try:
        user = await UserService(session).getUserById(user_id)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"user": user}
        )
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail}
        )

@router.post("/logout")
async def logout(
    push_end: str | None = None,
    user_id: UUID = Depends(auth_middleware), 
    session: AsyncSession = Depends(get_session)
):
    await TokenService(session).removeToken(user_id)

    if push_end is not None:
        await NotificationService(session).removeSub(user_id, push_end)

    res = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Success"}
    )
    
    res.delete_cookie("token")

    return res

@router.put("/changeInfo")
async def changeInfo(req: ChangeInfoReq, 
                     user_id: UUID = Depends(auth_middleware), 
                     session: AsyncSession = Depends(get_session)):
    try:
        user = await UserService(session).changeInfo(
            user_id, req.first_name, req.user_name, req.bio, 
            req.picture_id
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Success", 'user': user}
        )
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail}
        )

@router.post("/sendContactRequest/{user_name}")
async def sendContactRequest(user_name: str,
                             user_id: UUID = Depends(auth_middleware), 
                             session: AsyncSession = Depends(get_session)):
    try:
        # ignore @ at start
        if len(user_name) and user_name[0] == '@':
            user_name = user_name[1:]

        new_contact = await ContactService(session).sendContactRequest(
            user_id, user_name
        )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"new_contact": new_contact}
        )
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail}
        )
    
@router.post("/rejectContactRequest/{sender_id}")
async def rejectContactRequest(sender_id: str,
                               accepter_id: UUID = Depends(auth_middleware),
                               session: AsyncSession = Depends(get_session)):
    try:
        await ContactService(session).rejectContactRequest(
            accepter_id, UUID(sender_id)
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Contact rejected"}
        )
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail}
        )
    
@router.get("/getContactRequests")
async def getContactRequests(all: bool = False,
                             user_id: UUID = Depends(auth_middleware), 
                             session: AsyncSession = Depends(get_session)):
    res = {}
    res['ingoing'] = await ContactService(session).getUserContactRequests(
        user_id, False
    )
    if all:
        res['outgoing'] = await ContactService(session).getUserContactRequests(
            user_id, True
        )
    else:
        res['outgoing'] = {}

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=res
    )

@router.post('/generateUploadUrls')
async def generateUploadUrl(req: UploadUrlReq, user_id = Depends(auth_middleware), 
                            session: AsyncSession = Depends(get_session)):
    try:
        upload_urls = await FileService(session).generateUploadUrls(
            user_id, req.files, req.request_type
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={'upload_urls': upload_urls}
        )
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"message": e.detail}
        )
    
@router.post('/saveNotificationSub')
async def saveNotificationSub(req: NotificationReq, user_id = Depends(auth_middleware),
                              session: AsyncSession = Depends(get_session)):
    await NotificationService(session).saveSub(user_id, req.sub)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Success"}
    )