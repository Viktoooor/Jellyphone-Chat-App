from uuid import UUID, uuid4
from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models.user import User, Contact, ContactRequest
from ..models.chat import Chat
from ..models.chat_member import ChatMember
#from ..models.contact import Contact
#from ..models.contactRequest import ContactRequest
from ..s3 import s3_utils
from ..services.userService import UserService

class ContactService:
    def __init__(self, session: AsyncSession):
        self.session = session

    def getContactDump(self, contact, picture_url: str):
        contact_dump = {
            "chat_id": str(contact.chat_id),
            "user_id": str(contact.id),
            "user_name": contact.user_name,
            "first_name": contact.first_name,
            "picture": picture_url,
            "bio": contact.bio
        }

        return contact_dump

    async def getContact(self, user_id: UUID, contact_id: UUID):
        if user_id.int > contact_id.int:
            user_id, contact_id = contact_id, user_id

        query = select(Contact).where(Contact.user_id == user_id, 
                                      Contact.contact_id == contact_id)

        res = await self.session.exec(query)
        connection = res.first()

        return connection
    
    async def getContactRequest(self, sender_id: UUID, accepter_id: UUID):
        query = select(ContactRequest).where(
            ContactRequest.sender_id == sender_id,
            ContactRequest.accepter_id == accepter_id
        )

        res = await self.session.exec(query)
        connection = res.first()

        return connection
    
    async def getUserContact(self, user_id: UUID, contact_id: UUID):
        query = select(
            Contact.chat_id, User.id, User.user_name,
            User.first_name, User.picture, User.bio
        ).join(
            Contact, onclause=User.id == Contact.contact_id
        ).where(Contact.user_id == user_id, Contact.contact_id == contact_id)

        res = await self.session.exec(query)
        contact = res.first()

        if contact is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No contact was found"
            )
        
        picture_url = s3_utils.generate_download_url(
            contact.picture, "profilePictures"
        )

        return self.getContactDump(contact, picture_url)

    async def getUserContacts(self, user_id: UUID):
        stmt1 = select(
            Contact.chat_id, User.id, User.user_name,
            User.first_name, User.picture, User.bio
        ).join(
            Contact, onclause=User.id == Contact.contact_id
        ).where(Contact.user_id == user_id)

        stmt2 = select(
            Contact.chat_id, User.id, User.user_name,
            User.first_name, User.picture, User.bio
        ).join(
            Contact, onclause=User.id == Contact.user_id
        ).where(Contact.contact_id == user_id)

        query = stmt1.union_all(stmt2)

        res = await self.session.exec(query)
        users = res.all()

        contacts = {}
        
        for contact in users:
            picture_url = s3_utils.generate_download_url(
                contact.picture, "profilePictures"
            )

            contacts[str(contact.chat_id)] = self.getContactDump(
                contact, picture_url
            )

        return contacts
    
    async def getUserContactRequests(self, user_id: UUID, out: bool):
        if out:
            ids = select(ContactRequest.accepter_id).where(
                ContactRequest.sender_id == user_id,
                ContactRequest.blocked == False
            )
        else:
            ids = select(ContactRequest.sender_id).where(
                ContactRequest.accepter_id == user_id,
                ContactRequest.blocked == False
            )

        query = select(
            User.id, User.user_name, User.first_name, User.picture, User.bio
        ).where(User.id.in_(ids))
        
        res = await self.session.exec(query)
        users = res.all()

        contactRequests = []
        for contact in users:
            picture_url = s3_utils.generate_download_url(
                contact.picture, "profilePictures"
            )

            contactRequests.append(
                {
                    "user_id": str(contact.id),
                    "user_name": contact.user_name,
                    "first_name": contact.first_name,
                    "picture": picture_url,
                    "bio": contact.bio
                }
            )

        return contactRequests
    
    async def sendContactRequest(self, user_id: UUID, accepter_user_name: str):
        # get accepter id from his username
        query = select(User.id).where(User.user_name == accepter_user_name)
        res = await self.session.exec(query)
        accepter_id = res.first()

        if not accepter_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No user with this username was found"
            )
        
        if user_id == accepter_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You can't add yourself as a contact"
            )
        
        # check if user and accepter don't already have a contact
        isConnectionExist = await self.getContact(user_id, accepter_id)
        if isConnectionExist is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Contact already exists"
            )
        
        # check if user didn't send this request earlier
        contactRequest = await self.getContactRequest(user_id, accepter_id)
        if contactRequest is not None:
            if contactRequest.blocked:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User blocked you"
                )    
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Contact request already exists"
            )

        # check if user already has contact request from accepter
        contactRequest = await self.getContactRequest(accepter_id, user_id)
        if contactRequest is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Contact request already exists"
            )
        
        contactRequest = ContactRequest(
            sender_id=user_id, accepter_id=accepter_id, blocked=False
        )

        self.session.add(contactRequest)
        await self.session.commit()

        new_contact = await UserService(self.session).getUserById(accepter_id)

        return new_contact

    async def acceptContactRequest(self, accepter_id: UUID, sender_id: UUID):
        contactRequest = await self.getContactRequest(sender_id, accepter_id)

        if contactRequest is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No such request exists"
            )
        
        await self.session.delete(contactRequest)

        # user_id must be less than contact_id in db,
        # so getContact() makes only one query to check if contact exists
        user_id, contact_id = accepter_id, sender_id
        if user_id.int > contact_id.int:
            user_id, contact_id = contact_id, user_id

        new_chat_id = uuid4()
        chat = Chat(
            chat_id=new_chat_id,
            type="contact"
        )

        accepterMember = ChatMember(
            user_id=accepter_id,
            chat_id=new_chat_id
        )
        senderMember = ChatMember(
            user_id=sender_id,
            chat_id=new_chat_id
        )

        contact = Contact(
            user_id=user_id, contact_id=contact_id, chat_id=new_chat_id
        )

        self.session.add(chat)
        self.session.add(accepterMember)
        self.session.add(senderMember)
        self.session.add(contact)
        
        await self.session.commit()

        accepter_user = await UserService(self.session).getUserById(accepter_id)
        accepter_user['chat_id'] = str(new_chat_id)
        accepter_user['user_id'] = accepter_user.pop('id')
        sender_user = await UserService(self.session).getUserById(sender_id)
        sender_user['chat_id'] = str(new_chat_id)
        sender_user['user_id'] = sender_user.pop('id')

        return {
            'accepter_user': accepter_user, 'sender_user': sender_user,
            'chat_id': str(new_chat_id)
        }

    async def rejectContactRequest(self, accepter_id: UUID, sender_id: UUID):
        contactRequest = await self.getContactRequest(sender_id, accepter_id)

        if contactRequest is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No such request exists"
            )

        contactRequest.blocked = True
        self.session.add(contactRequest)
        await self.session.commit()

    async def removeContact(self, user_id: UUID, contact_id: UUID):
        contact = await self.getContact(user_id, contact_id)

        if contact is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove contact that doesn't exist"
            )
        
        query = select(Chat).where(Chat.chat_id == contact.chat_id)
        
        chat = await self.session.exec(query)
        chat = chat.first()

        await self.session.delete(chat)
        await self.session.commit()

        return {'chat_id': str(contact.chat_id), 'sender_id': str(user_id)}