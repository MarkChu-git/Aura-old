import asyncio
import logging
import sys
import os

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal
from app.db.models.user import User
from app.core.security import verify_password
from sqlalchemy import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def verify_admin_login():
    async with AsyncSessionLocal() as db:
        try:
            admin_email = "admin@scent.ai"
            password_to_check = "admin123"
            
            # Fetch user
            result = await db.execute(select(User).filter(User.email == admin_email))
            user = result.scalars().first()
            
            if not user:
                logger.error(f"User {admin_email} NOT FOUND in database.")
                return

            logger.info(f"User found: {user.email}")
            logger.info(f"Stored Hash: {user.hashed_password}")
            
            # Verify
            is_valid = verify_password(password_to_check, user.hashed_password)
            if is_valid:
                logger.info("✅ SUCCESS: Password 'admin123' matches stored hash.")
            else:
                logger.error("❌ FAILURE: Password 'admin123' does NOT match stored hash.")
        
        except Exception as e:
            logger.error(f"Error verifies auth: {e}")

if __name__ == "__main__":
    asyncio.run(verify_admin_login())
