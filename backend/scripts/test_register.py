import asyncio
import logging
import sys
import os
import secrets

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core import security

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_password_strength():
    weak_passwords = [
        "short",
        "onlylowercase",
        "ONLYUPPERCASE",
        "NoNumbersOrSymbols!",
        "NoSymbols123",
        "NoNumbers!@#"
    ]
    
    strong_passwords = [
        "StrongPass123!",
        "Correct-Battery-Horse-Staple-1!",
        "Secure#Password99"
    ]
    
    logger.info("Testing Weak Passwords (should FAIL):")
    for p in weak_passwords:
        is_valid = security.validate_password_strength(p)
        if not is_valid:
            logger.info(f"✅ Correctly rejected: {p}")
        else:
            logger.error(f"❌ FAILED: Accepted weak password: {p}")

    logger.info("\nTesting Strong Passwords (should PASS):")
    for p in strong_passwords:
        is_valid = security.validate_password_strength(p)
        if is_valid:
            logger.info(f"✅ Correctly accepted: {p}")
        else:
            logger.error(f"❌ FAILED: Rejected strong password: {p}")

if __name__ == "__main__":
    test_password_strength()
