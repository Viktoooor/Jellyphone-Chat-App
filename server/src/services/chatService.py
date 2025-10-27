from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID, uuid4
from sqlmodel import select
from ..models.chat import Chat
from ..models.chat_member import ChatMember
from ..models.user import User
from ..services.messageService import MessageService
from ..services.userService import UserService
from ..services.contactService import ContactService
from fastapi import HTTPException, status
from ..s3 import s3_utils

class ChatService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def checkChatMembership(self, user_id: UUID, chat_id: UUID,
                                  error: str = "User is not member of this group"):
        query = select(ChatMember).where(
            ChatMember.chat_id == chat_id,
            ChatMember.user_id == user_id
        )

        res = await self.session.exec(query)
        res = res.first()

        if res is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error
            )
        
        return res
    
    async def getChatMembers(self, chat_id: UUID):
        query = select(ChatMember.user_id).where(ChatMember.chat_id == chat_id)

        res = await self.session.exec(query)
        members = res.all()

        return members
    
    async def getChats(self, user_id: UUID):
        query = select(ChatMember.chat_id, ChatMember.role, Chat.type).join(
            ChatMember,
            onclause=Chat.chat_id == ChatMember.chat_id
        ).where(ChatMember.user_id == user_id)

        res = await self.session.exec(query)
        res = res.all()
        if res is None:
            return []
        
        chats = []
        for [chat_id, role, type] in res:
            chats.append({
                "chat_id": str(chat_id),
                "type": type,
                "role": role
            })

        return chats
    
    async def getChatInfo(self, chat_id: UUID):
        query = select(Chat.info).where(Chat.chat_id == chat_id)

        res = await self.session.exec(query)
        info = res.first()

        return info
    
    async def getGroupChatById(self, chat_id: UUID):
        query = select(
            ChatMember.user_id, ChatMember.role, User.user_name,
            User.first_name, User.picture, User.bio
        ).join(
            User,
            onclause=ChatMember.user_id == User.id
        ).where(
            ChatMember.chat_id == chat_id
        )
        res = await self.session.exec(query)
        res = res.all()

        members = []
        if res is not None:
            for member in res:
                picture_url = s3_utils.generate_download_url(
                    member.picture, "profilePictures"
                )

                members.append({
                    "role": member.role,
                    "user_id": str(member.user_id),
                    "user_name": member.user_name,
                    "first_name": member.first_name,
                    "picture": picture_url,
                    "bio": member.bio
                })

        info = await self.getChatInfo(chat_id)

        picture_id = "default.png"
        if 'picture' in info:
            picture_id = info['picture']
        picture_url = s3_utils.generate_download_url(
            picture_id, "groupPictures"
        )

        return {
            "name": info['name'],
            "picture": picture_url,
            "members": members
        }

    # seems to be working
    async def getGroupChats(self, user_id: UUID):
        chatsQ = select(ChatMember.chat_id, Chat.info).join(
            ChatMember,
            onclause=Chat.chat_id == ChatMember.chat_id
        ).where(ChatMember.user_id == user_id, Chat.type == 'group')

        chatIds = select(ChatMember.chat_id).join(
            Chat,
            onclause=ChatMember.chat_id == Chat.chat_id
        ).where(ChatMember.user_id == user_id, Chat.type == 'group')

        membersQ = select(
            ChatMember.chat_id, ChatMember.role, ChatMember.user_id, User.user_name,
            User.first_name, User.picture, User.bio
        ).join(
            User,
            onclause=ChatMember.user_id == User.id
        ).where(
            ChatMember.chat_id.in_(chatIds)
        )

        res = await self.session.exec(chatsQ)
        res = res.all()
        if res is None:
            return {}
        
        chats = {}

        for [chat_id, info] in res:
            picture_id = 'default.png'
            if 'picture' in info:
                picture_id = info['picture']
            picture_url = s3_utils.generate_download_url(
                picture_id, "groupPictures"
            )
            chats[str(chat_id)] = {
                "name": info['name'],
                "picture": picture_url,
                "members": []
            }
        
        res = await self.session.exec(membersQ)
        res = res.all()

        for member in res:
            picture_url = s3_utils.generate_download_url(
                member.picture, "profilePictures"
            )

            chats[str(member.chat_id)]['members'].append({
                "role": member.role,
                "user_id": str(member.user_id),
                "user_name": member.user_name,
                "first_name": member.first_name,
                "picture": picture_url,
                "bio": member.bio
            })

        return chats
    
    async def createGroupChat(
            self, creator_id: UUID, name: str, members: set,
            picture_id: str | None):
        # init group info
        new_chat_id = uuid4()
        if picture_id is None:
            picture_id = 'default.png'
        group_info = {
            "name": name,
            "picture": picture_id
        }

        # create new chat
        new_group_chat = Chat(
            chat_id=new_chat_id, type='group',
            info=group_info
        )

        self.session.add(new_group_chat)

        creator = ChatMember(user_id=creator_id, chat_id=new_chat_id, role='admin')
        self.session.add(creator)
        
        for user_id in members:
            # just in case
            if user_id == str(creator_id):
                continue
            con = await ContactService(self.session).getContact(
                creator_id, UUID(user_id)
            )

            if con is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Can not add member that is not your contact"
                )

            new_member = ChatMember(user_id=UUID(user_id), chat_id=new_chat_id)
            self.session.add(new_member)

        await self.session.commit()

        # get users name
        creator_name = await UserService(self.session).getNameById(creator_id)

        # "User created group" message
        message = await MessageService(self.session).saveMessage(
            message='', chat_id=str(new_chat_id),
            meta={
                "type": "info",
                "event": "createGroup",
                "user_id": str(creator_id),
                "user_name": creator_name,
            }
        )
        
        group_chat = await self.getGroupChatById(new_chat_id)
        res = {
            "new_chat": {"chat_id": str(new_chat_id), "type": "group", "role": "admin"},
            "new_group": group_chat, "new_message": message
        }
        
        return res
    
    async def editGroup(self, chat_id: UUID, user_id: UUID, name: str, 
                        membersToAdd: set, picture_id: str | None):
        # check chat membership
        await self.checkChatMembership(
            user_id, chat_id, "You are not member of this group"
        )
        
        # get chat
        query = select(Chat).where(Chat.chat_id == chat_id)

        chat = await self.session.exec(query)
        chat = chat.first()

        if chat is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid chat id"
            )
        
        user_name = await UserService(self.session).getNameById(user_id)
        
        new_messages = []

        new_group_info = {
            'name': chat.info['name'],
            'picture': chat.info['picture']
        }
        if chat.info['name'] != name:
            new_group_info['name'] = name
            message = await MessageService(self.session).saveMessage(
                message='', chat_id=str(chat_id), 
                meta={
                    "type": "info",
                    "event": "editGroupName",
                    "user_id": str(user_id),
                    "user_name": user_name,
                    "new_name": name
                }
            )
            new_messages.append(message)
        if picture_id is not None:
            new_group_info['picture'] = picture_id
            message = await MessageService(self.session).saveMessage(
                message='', chat_id=str(chat_id), 
                meta={
                    "type": "info",
                    "event": "editGroupPicture",
                    "user_id": str(user_id),
                    "user_name": user_name
                }
            )
            new_messages.append(message)
        chat.info = new_group_info

        for new_member_id in membersToAdd:
            member_id = UUID(new_member_id)
            con = await ContactService(self.session).getContact(user_id, member_id)
            if con is None:
                continue

            new_member = ChatMember(user_id=member_id, chat_id=chat_id)
            self.session.add(new_member)

            new_member_name = await UserService(self.session).getNameById(member_id)
            message = await MessageService(self.session).saveMessage(
                message='', chat_id=str(chat_id), 
                meta={
                    "type": "info",
                    "event": "addMember",
                    "user_id": str(user_id),
                    "user_name": user_name,
                    "member_id": new_member_id,
                    "member_name": new_member_name
                }
            )
            new_messages.append(message)
        
        await self.session.commit()

        group_chat = await self.getGroupChatById(chat_id)
        res = {
            "chat_id": str(chat_id), "new_messages": new_messages,
            'new_group': group_chat
        }

        return res
    
    async def removeMember(self, user_id: UUID, chat_id: UUID, member_id: UUID):
        # check chat membership of user and member
        if user_id == member_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You can't remove yourself from group"
            )
        
        user_member = await self.checkChatMembership(
            user_id, chat_id, "You are not member of this group"
        )
        if user_member.role != 'admin':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You can't remove members"
            )
        
        membership = await self.checkChatMembership(member_id, chat_id)

        await self.session.delete(membership)

        # add "'User' removed 'member' from group" message
        user_name = await UserService(self.session).getNameById(user_id)
        member_name = await UserService(self.session).getNameById(member_id)

        message = await MessageService(self.session).saveMessage(
            message='', chat_id=str(chat_id),
            meta={
                "type": "info",
                "event": "removeMember",
                "user_id": str(user_id),
                "user_name": user_name,
                "member_id": str(member_id),
                "member_name": member_name
            }
        )

        await self.session.commit()
        
        return {
            'chat_id': str(chat_id), "member_id": str(member_id),
            "message": message
        }

    async def leaveGroup(self, user_id: UUID, chat_id: UUID):
        query = select(ChatMember).where(
            ChatMember.chat_id == chat_id,
            ChatMember.user_id == user_id
        )

        res = await self.session.exec(query)
        membership = res.first()

        if membership is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not member of this group"
            )

        await self.session.delete(membership)

        user_name = await UserService(self.session).getNameById(user_id)

        # "User left group" message
        message = await MessageService(self.session).saveMessage(
            message='', chat_id=str(chat_id),
            meta={
                "type": "info",
                "event": "leftGroup",
                "user_id": str(user_id),
                "user_name": user_name,
            }
        )

        await self.session.commit()

        return {
            'message': message, 'chat_id': str(chat_id) ,'member_id': str(user_id)
        }