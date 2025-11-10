from sqlmodel.ext.asyncio.session import AsyncSession
from ..models.notification_sub import NotificationSub
from uuid import UUID
import os
from pywebpush import webpush, WebPushException
from sqlmodel import select
import json

class NotificationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def saveSub(self, user_id: UUID, sub: str):
        new_sub = NotificationSub(user_id=user_id, sub=json.loads(sub))
        self.session.add(new_sub)

        await self.session.commit()
        
    async def removeSub(self, user_id: UUID, endpoint: str):
        query = select(NotificationSub).where(
            NotificationSub.user_id == user_id,
            NotificationSub.sub['endpoint'].astext == endpoint
        )
        res = await self.session.exec(query)
        sub_to_remove = res.first()

        await self.session.delete(sub_to_remove)
        await self.session.commit()

    async def sendNotification(self, user_id: UUID, data: dict):
        vapid_private_key = os.getenv('VAPID_PRIVATE_KEY')
        service_mail = os.getenv('SMTP_NAME')
        query = select(NotificationSub).where(NotificationSub.user_id == user_id)
        res = await self.session.exec(query)
        devices = res.all()

        notification = {
            'title': data['sender_name'],
            'body': data['message'],
            'open_url': f'/chat?c={data["chat_id"]}'
        }

        claims = {"sub": f"mailto:{service_mail}"}

        for device in devices:
            try:
                webpush(
                    subscription_info=device.sub,
                    data=json.dumps(notification),
                    vapid_private_key=vapid_private_key,
                    vapid_claims=claims
                )
            except WebPushException as e:
                if(e.message.startswith("Push failed: 410 Gone")):
                    await self.removeSub(user_id, device.sub["endpoint"])