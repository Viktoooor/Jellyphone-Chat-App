from fastapi import APIRouter, WebSocket, Depends, WebSocketDisconnect, HTTPException
from fastapi import status
from ..services.tokenService import TokenService
from ..db.main import get_session
from ..services.wsService import WSService
from ..services.messageService import MessageService
from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID
from pydantic import ValidationError

router = APIRouter(prefix='/apiws')

manager = WSService()

@router.websocket('/')
async def WSMain(websocket: WebSocket, session: AsyncSession = Depends(get_session)):
    # Authorization
    token = websocket.cookies.get('token')
    
    try:
        user = TokenService.validateToken(token)
    except HTTPException as e:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    user_id = user['id']

    await manager.connect(user_id, websocket, session)

    try:
        while True:
            data = await websocket.receive_json()
            res = None
            request_id = None
            if 'request_id' in data:
                request_id = data['request_id']

            # router
            if data['type'] == 'send_message':
                # client id is user created id that was created to
                # swap 'optimistic' created message with server created one
                client_id = None
                if 'id' in data:
                    client_id = data['id']
                res = await manager.sendMessage(
                    user_id, client_id, data['chat_id'], data['message'],
                    data['meta'], session
                )
            elif data['type'] == 'edit_message':
                await manager.editMessage(
                    user_id, data['message_id'], data['edited_message'], session
                )
            elif data['type'] == 'delete_message':
                await manager.deleteMessage(
                    user_id, data['message_id'], session
                )
            elif data['type'] == 'read_messages':
                await manager.readMessages(
                    user_id, data['chat_id'], session
                )
            elif data['type'] == 'get_data':
                res = await manager.fetchData(UUID(user_id), session)
            elif data['type'] == 'load_messages':
                res = await MessageService(session).loadMessages(
                    data['chat_id'], data['offset']
                )
            elif data['type'] == 'accept_contact':
                res = await manager.acceptContact(
                    user_id, data['sender_id'], session
                )
            elif data['type'] == 'create_group':
                picture_id = None
                if 'picture_id' in data:
                    picture_id = data['picture_id']
                res = await manager.createGroup(
                    user_id, data['name'], data['members'], picture_id,
                    session
                )
            elif data['type'] == 'edit_group':
                picture_id = None
                if 'picture_id' in data:
                    picture_id = data['picture_id']
                res = await manager.editGroup(
                    user_id, data['chat_id'], data['name'], data['members_to_add'],
                    picture_id, session
                )
            elif data['type'] == 'remove_contact':
                res = await manager.removeContact(
                    user_id, data['contact_id'], session
                )
            elif data['type'] == 'remove_member':
                res = await manager.removeMember(
                    user_id, data['chat_id'], data['member_id'], session
                )
            elif data['type'] == 'leave_group':
                res = await manager.leaveGroup(
                    user_id, data['chat_id'], session
                )
            elif data['type'] == 'send_status': 
                await manager.sendResponse(
                    res_type='receive_status', recipient_id=data['recipient_id'], 
                    data={"chat_id": data['chat_id'], "status": data['status']},
                    session=session
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid request type"
                )
            
            if res is not None:
                await websocket.send_json({
                    "status": "OK", "type": data['type'],
                    "data": res, "request_id": request_id
                })
    except HTTPException as e:
        await websocket.send_json({
            "status": "Bad Request", "data": {"message": e.detail},
            "request_id": request_id
        })
    except ValidationError as e:
        # only cause by invalid message meta
        await websocket.send_json({
            "status": "Bad Request", "data": {"message": "Invalid message meta"},
            "request_id": request_id
        })
    except ValueError as e:
        # error getting encryption key
        await websocket.send_json({"status": "Server Error", "data": res})
    except WebSocketDisconnect:
        await manager.disconnect(user_id, websocket, session)
    except Exception:
        await manager.disconnect(user_id, websocket, session)