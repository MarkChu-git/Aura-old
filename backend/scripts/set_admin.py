
import asyncio
import sys
import os
import logging
from sqlalchemy import select
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load env vars from backend/.env
# Note: On server, you might need to adjust the path or rely on system env vars
load_dotenv(os.path.join(os.getcwd(), "backend/.env"))

# Add parent directory to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.db.session import AsyncSessionLocal
from app.db.models.user import User

async def set_admin_role(email):
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(User).filter(User.email == email))
            user = result.scalars().first()
            
            if not user:
                logger.error(f"User {email} not found!")
                return
            
            if user.role == "admin":
                logger.info(f"User {email} is already an admin.")
                return

            logger.info(f"Promoting user {email} to admin...")
            user.role = "admin"
            db.add(user)
            await db.commit()
            logger.info(f"Successfully updated {email} role to 'admin'.")
            
        except Exception as e:
            logger.error(f"Error updating user role: {e}")
            await db.rollback()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        email = sys.argv[1]
    else:
        print("Usage: python scripts/set_admin.py <email>")
        sys.exit(1)
        
    asyncio.run(set_admin_role(email))
