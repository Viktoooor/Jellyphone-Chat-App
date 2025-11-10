from fastapi import WebSocket
from sqlmodel.ext.asyncio.session import AsyncSession
from ..services.messageService import MessageService
from ..services.chatService import ChatService
from ..services.contactService import ContactService
from ..services.notificationService import NotificationService
from uuid import UUID
from ..schemas.messageMeta import MessageMeta
import asyncio

class WSService:
    def __init__(self):
        self.connections: dict[str, list[WebSocket]] = {}

    async def sendResponse(self, session: AsyncSession,
                           recipient_id: str, data: dict, status: str = 'OK',
                           res_type: str | None = None,
                           request_id: str | None = None):
        if recipient_id in self.connections:
            connections = self.connections[recipient_id][:]

            for con in connections:
                try:
                    await con.send_json({
                        "status": status,
                        "type": res_type,
                        "data": data,
                        "request_id": request_id
                    })
                except Exception:
                    await self.disconnect(recipient_id, con, session)
        elif res_type == 'receive_message':
            asyncio.create_task(NotificationService(session).sendNotification(
                recipient_id, data["message"]
            ))

    async def sendStatusToContacts(self, user_id: str, status: str,
                                   session: AsyncSession):
        contacts = await ContactService(session).getUserContacts(user_id)

        for chat_id, contact in contacts.items():
            await self.sendResponse(
                recipient_id=contact['user_id'], res_type='receive_status', 
                data={'chat_id': chat_id, 'status': status}, session=session
            )

    async def connect(self, user_id: str, websocket: WebSocket, 
                      session: AsyncSession):
        await websocket.accept()

        if user_id not in self.connections:
            self.connections[user_id] = []
        self.connections[user_id].append(websocket)

        await self.sendStatusToContacts(user_id, 'online', session)
    
    async def disconnect(self, user_id: str, websocket: WebSocket, 
                         session: AsyncSession):
        if user_id in self.connections:
            self.connections[user_id].remove(websocket)
            
            if not self.connections[user_id]:
                del self.connections[user_id]

        await self.sendStatusToContacts(user_id, 'offline', session)

    def getContactsStatus(self, contacts: dict):
        status = {}

        for chat_id, contact in contacts.items():
            if (contact['user_id'] in self.connections and
                len(self.connections[contact['user_id']]) > 0):
                status[chat_id] = 'online'
            else:
                status[chat_id] = 'offline'

        return status

    async def fetchData(self, user_id: UUID, session: AsyncSession): 
        contacts = await ContactService(session).getUserContacts(user_id)
        chats = await ChatService(session).getChats(user_id)
        groupChats = await ChatService(session).getGroupChats(user_id)
        messages = await MessageService(session).getLastMessages(user_id)
        status = self.getContactsStatus(contacts)

        return {
            "contacts": contacts, "messages": messages,
            "chats": chats, "groupChats": groupChats, 'status': status
        }

    async def sendMessageToMembers(self, members, data: dict, session: AsyncSession,
                                     except_id: str | None = None,
                                     res_type: str = 'receive_message'):
        for id in members:
            recipient_id = str(id)
            if recipient_id != except_id:
                await self.sendResponse(
                    recipient_id=recipient_id, res_type=res_type, data=data,
                    session=session
                )

    async def sendMessage(
            self, user_id: str, client_id: str | None, chat_id: str, message: str,
            meta: dict, session: AsyncSession
    ):
        await ChatService(session).checkChatMembership(
            UUID(user_id), UUID(chat_id)
        )
        
        meta['sender_id'] = user_id
        meta['read'] = False
        # validate meta, raises ValueError
        MessageMeta(**meta)
        # encrpyts and saves message in db        
        new_message = await MessageService(session).saveMessage(
            message, chat_id, meta
        )
        
        members = await ChatService(session).getChatMembers(UUID(chat_id))
  
        await self.sendMessageToMembers(
            members=members, session=session,
            data={"chat_id":  new_message['chat_id'], "message": new_message},
            except_id=user_id
        )
        
        res = {"chat_id": new_message['chat_id'], "message": new_message}
        if client_id:
            res['client_id'] = client_id
        return res
    
    async def editMessage(self, user_id: str, message_id: str,
                          edited_message: str, session: AsyncSession):
        new_message = await MessageService(session).editMessage(
            UUID(user_id), UUID(message_id), edited_message
        )

        chat_id = new_message['chat_id']
        members = await ChatService(session).getChatMembers(UUID(chat_id))

        await self.sendMessageToMembers(
            members=members,
            data={"message": new_message},
            except_id=user_id,
            res_type='edit_message',
            session=session
        )

    async def deleteMessage(self, user_id: str, message_id: str,
                            session: AsyncSession):
        deleted_message = await MessageService(session).deleteMessage(
            UUID(user_id), UUID(message_id)
        )

        chat_id = deleted_message['chat_id']
        deleted_message_id = deleted_message['id']
        
        members = await ChatService(session).getChatMembers(UUID(chat_id))
        await self.sendMessageToMembers(
            members=members,
            data={"id": deleted_message_id, "chat_id": chat_id},
            res_type='delete_message',
            session=session
        )

    async def readMessages(self, user_id: str, chat_id: str, session: AsyncSession):
        await ChatService(session).checkChatMembership(
            UUID(user_id), UUID(chat_id)
        )

        await MessageService(session).readMessages(UUID(chat_id))

        members = await ChatService(session).getChatMembers(UUID(chat_id))
        await self.sendMessageToMembers(
            members=members, data={"chat_id": chat_id}, res_type="read_messages",
            session=session
        )

    async def acceptContact(self, accepter_id: str, sender_id: str,
                            session: AsyncSession):
        res = await ContactService(session).acceptContactRequest(
            UUID(accepter_id), UUID(sender_id)
        )

        # sender will get contact info of accepter
        # and accepter will get info of sender
        await self.sendMessageToMembers(
            members=[UUID(sender_id)],
            data={'new_contact': res['accepter_user'], 'new_chat_id': res['chat_id']},
            res_type='add_contact',
            session=session
        )
        return {
            'new_contact': res['sender_user'], 'new_chat_id': res['chat_id']
        }

    async def removeContact(self, user_id: str, contact_id: str, 
                            session: AsyncSession):
        res = await ContactService(session).removeContact(
            UUID(user_id), UUID(contact_id)
        )

        await self.sendMessageToMembers(
            members=[UUID(contact_id)], data=res, res_type='remove_contact',
            session=session
        )
        return res
    
    async def removeMember(self, user_id: str, chat_id: str, member_id: str,
                           session: AsyncSession):
        members = await ChatService(session).getChatMembers(UUID(chat_id))
        res = await ChatService(session).removeMember(
            UUID(user_id), UUID(chat_id), UUID(member_id)
        )

        # send to all members, not only recipient
        await self.sendMessageToMembers(
            members=members,
            data=res,
            except_id=user_id,
            res_type='remove_member',
            session=session
        )
        return res

    async def leaveGroup(self, user_id: str, chat_id: str, session: AsyncSession):
        members = await ChatService(session).getChatMembers(UUID(chat_id))
        res = await ChatService(session).leaveGroup(
            UUID(user_id), UUID(chat_id)
        )

        await self.sendMessageToMembers(
            members=members,
            data=res,
            except_id=user_id,
            res_type='remove_member',
            session=session
        )
        return res

    async def createGroup(self, user_id: str, name: str, members: list[str],
                          picture_id: str, session: AsyncSession):
        res = await ChatService(session).createGroupChat(
            UUID(user_id), name, set(members), picture_id
        )

        await self.sendMessageToMembers(
            members=set(members),
            data=res,
            res_type='add_group',
            session=session
        )
        return res

    async def editGroup(self, user_id: str, chat_id: str, name: str,
                        membersToAdd: list[str], picture_id: str | None,
                        session: AsyncSession):
        res = await ChatService(session).editGroup(
            UUID(chat_id), UUID(user_id), name, set(membersToAdd), picture_id
        )
        members = await ChatService(session).getChatMembers(UUID(chat_id))

        await self.sendMessageToMembers(
            members=members,
            data=res,
            except_id=user_id,
            res_type='edit_group',
            session=session
        )
        return res