"""
Google Authentication Module

Handles Google ID token verification and user authentication.
"""

import logging
from typing import Dict, Any
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings

logger = logging.getLogger(__name__)


class GoogleAuthError(Exception):
    """Raised when Google authentication fails"""

    pass


class EmailNotVerifiedError(GoogleAuthError):
    """Raised when Google email is not verified"""

    pass


def verify_google_token(credential: str) -> Dict[str, Any]:
    """
    Verify Google ID token and return user info.

    Args:
        credential: Google ID token JWT

    Returns:
        Dict containing user info (sub, email, name, picture, email_verified)

    Raises:
        GoogleAuthError: If token verification fails
    """
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            credential, requests.Request(), settings.GOOGLE_CLIENT_ID
        )

        # Verify issuer
        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise GoogleAuthError("Invalid token issuer")

        # Verify email is verified
        if not idinfo.get("email_verified", False):
            raise EmailNotVerifiedError("Google email not verified")

        return {
            "sub": idinfo["sub"],  # Google stable user ID
            "email": idinfo["email"],
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
            "email_verified": idinfo["email_verified"],
        }

    except ValueError as e:
        # Invalid token
        error_msg = str(e)
        logger.warning(f"Google token verification failed: {error_msg}")
        raise GoogleAuthError(f"Invalid Google credential: {error_msg}")
    except Exception as e:
        logger.error(f"Unexpected error during Google auth: {str(e)}")
        raise GoogleAuthError("Authentication failed")
