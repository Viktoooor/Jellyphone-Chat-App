import os
from uuid import UUID
from sqlmodel.ext.asyncio.session import AsyncSession
from cryptography.fernet import Fernet
from ..models.message import Message
from ..models.chat_member import ChatMember
from ..models.user import User
from datetime import datetime, timezone
from sqlmodel import select
from sqlalchemy import update, func, cast, Boolean
from fastapi import HTTPException, status
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import aliased
from sqlalchemy.orm.attributes import flag_modified
from ..s3 import s3_utils

class MessageService:
    def __init__(self, session: AsyncSession):
        self.session = session

        key = os.getenv('KEY')
        if not key:
            raise ValueError('No encryption key set')
        self.key = Fernet(key)
        self.fallback_uuid_str='00000000-0000-0000-0000-000000000000'

    def getMessageDump(self, message: Message, sender_name: str | None = None,
                       reply_name: str | None = None):
        message_dump = message.model_dump()
        if sender_name is not None:
            message_dump['sender_name'] = sender_name
        if reply_name is not None:
            message_dump['reply_name'] = reply_name

        message_dump['chat_id'] = str(message_dump['chat_id'])
        message_dump['id'] = str(message_dump['id'])
        message_dump['message'] = self.key.decrypt(
            message_dump['message']
        ).decode('utf-8')
        message_dump['send_time'] = message_dump['send_time'].isoformat()

        if 'reply_message' in message_dump['meta']:
            encrypted_reply = message_dump['meta']['reply_message'].encode('utf-8')
            message_dump['meta']['reply_message'] = self.key.decrypt(
                encrypted_reply
            ).decode('utf-8')
        
        if 'file_id' in message_dump['meta']:
            file_url = s3_utils.generate_download_url(
                message_dump['meta']['file_id'], "chatPictures"
            )
            message_dump['meta']['file_url'] = file_url

        return message_dump

    async def getMessageById(self, message_id: UUID, join: bool = False):
        query = select(Message).where(Message.id == message_id)
        if join is True:
            UserSender = aliased(User, name='sender')
            UserReply = aliased(User, name='reply')

            sender_id_uuid = self.getMetaKey('sender_id')
            reply_id_uuid = self.getMetaKey('reply_user_id')

            query = select(
                Message, UserSender.first_name.label('sender_name'),
                UserReply.first_name.label('reply_name')
            ).join(
                UserSender, onclause=sender_id_uuid==UserSender.id, isouter=True
            ).join(
                UserReply, onclause=reply_id_uuid==UserReply.id, isouter=True
            ).where(Message.id == message_id)

        message = await self.session.exec(query)
        message = message.first()

        if message is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid message id"
            )
        
        return message
    
    def getMetaKey(self, key: str):
        id_text = Message.meta.op('->>')(key)
        id_text = func.coalesce(id_text, self.fallback_uuid_str)
        id_uuid = cast(id_text, PG_UUID)

        return id_uuid

    async def getLastMessages(self, user_id: UUID):
        stmt1 = select(ChatMember.chat_id).where(ChatMember.user_id == user_id)

        UserSender = aliased(User, name='sender')
        UserReply = aliased(User, name='reply')

        sender_id_uuid = self.getMetaKey('sender_id')
        reply_id_uuid = self.getMetaKey('reply_user_id')

        query = select(
            Message, UserSender.first_name.label('sender_name'),
            UserReply.first_name.label('reply_name')
        ).distinct(
            Message.chat_id
        ).join(
            UserSender, onclause=sender_id_uuid==UserSender.id, isouter=True
        ).join(
            UserReply, onclause=reply_id_uuid==UserReply.id, isouter=True
        ).where(
            Message.chat_id.in_(stmt1)
        ).order_by(Message.chat_id, Message.send_time.desc())

        res = await self.session.exec(query)
        res_messages = res.all()

        messages = {}

        for message, sender_name, reply_name in res_messages:
            message_dump = self.getMessageDump(message, sender_name, reply_name)
            messages[message_dump['chat_id']] = [message_dump]

        return messages
    
    async def loadMessages(self, chat_id: str, offset: int):
        UserSender = aliased(User, name='sender')
        UserReply = aliased(User, name='reply')

        sender_id_uuid = self.getMetaKey('sender_id')
        reply_id_uuid = self.getMetaKey('reply_user_id')

        query = select(
            Message, UserSender.first_name.label('sender_name'),
            UserReply.first_name.label('reply_name')
        ).join(
            UserSender, onclause=sender_id_uuid==UserSender.id, isouter=True
        ).join(
            UserReply, onclause=reply_id_uuid==UserReply.id, isouter=True
        ).where(
            Message.chat_id == UUID(chat_id)
        ).order_by(Message.send_time.desc()).offset(offset).limit(30)

        res = await self.session.exec(query)
        res_messages = res.all()

        if res_messages is None or len(res_messages) == 0:
            return {"messages": []}

        messages = []

        for message, sender_name, reply_name in res_messages:
            message_dump = self.getMessageDump(message, sender_name, reply_name)
            messages.append(message_dump)
        messages.reverse()

        return {"chat_id": chat_id, "messages": messages}

    async def saveMessage(self, message: str, chat_id: str, meta: dict):
        encrypted_message = self.key.encrypt(message.encode('utf-8'))
        
        if 'reply_id' in meta:
            messageToReply = await self.getMessageById(
                UUID(meta['reply_id'])
            )
            messageToReply_dump = self.getMessageDump(messageToReply)
            # saves encrypted message in string format (originaly was in bytes)
            meta['reply_message'] = messageToReply.message.decode('utf-8')
            meta['reply_user_id'] = messageToReply_dump['meta']['sender_id']

        new_message = Message(
            chat_id=chat_id,
            message=encrypted_message,
            meta=meta,
            send_time=datetime.now(timezone.utc)
        )

        self.session.add(new_message)
        await self.session.commit()
    
        await self.session.refresh(new_message)
        res = await self.getMessageById(new_message.id, True)
        [message_full, sender_name, reply_name] = res

        return self.getMessageDump(
            message_full, sender_name, reply_name
        )
    
    async def editMessage(self, user_id: UUID, message_id: UUID, edited_message: str):
        message = await self.getMessageById(message_id)
        
        if message.meta['sender_id'] != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot edit a message that was not sent by you"
            )
        
        encrypted_message = self.key.encrypt(edited_message.encode('utf-8'))
        message.message = encrypted_message
        message.meta['edited'] = True
        flag_modified(message, "meta")
        
        await self.session.commit()

        new_message = self.getMessageDump(message)
        return {
            'chat_id': new_message['chat_id'], 'id': new_message['id'],
            'message': edited_message
        }
    
    async def deleteMessage(self, user_id: UUID, message_id: UUID):
        message = await self.getMessageById(message_id)
        
        if message.meta['sender_id'] != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete a message that was not sent by you"
            )
        
        message_dump = self.getMessageDump(message)

        await self.session.delete(message)
        await self.session.commit()

        return message_dump
    
    async def readMessages(self, chat_id: UUID):
        new_value_expr = cast(True, JSONB)

        query = update(Message).where(
            Message.chat_id == chat_id,
            cast(Message.meta['read'].astext, Boolean) == False
        ).values(
            meta=func.jsonb_set(
                Message.meta,
                ['read'],
                new_value_expr
            )
        )

        await self.session.exec(query)
        await self.session.commit()