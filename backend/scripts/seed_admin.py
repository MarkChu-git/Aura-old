import asyncio
import logging
import sys
import os

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal
from app.db.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_admin():
    async with AsyncSessionLocal() as db:
        try:
            admin_email = "admin@scent.ai"
            # Check if exists
            result = await db.execute(select(User).filter(User.email == admin_email))
            user = result.scalars().first()
            
            if user:
                logger.info(f"Admin user {admin_email} already exists.")
                return

            logger.info(f"Creating admin user {admin_email}...")
            user = User(
                email=admin_email,
                hashed_password=get_password_hash("admin123"), # Default password
                role="admin",
                is_active=True
            )
            db.add(user)
            await db.commit()
            logger.info("Admin user created successfully.")
        
        except Exception as e:
            logger.error(f"Error seeding admin: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(seed_admin())
