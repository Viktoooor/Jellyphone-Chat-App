from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DB_URL")

async_engine = create_async_engine(url=DB_URL, echo=False)

async_session = async_sessionmaker(
    bind=async_engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session