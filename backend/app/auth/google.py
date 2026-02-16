"""
Google Authentication Module.

This module handles the verification of Google ID tokens using the `google-auth` library.
It validates the token signature, issuer, and expiration, and ensures that the user's
email address has been verified by Google.
"""

import logging
from typing import Dict, Any
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings

logger = logging.getLogger(__name__)


class GoogleAuthError(Exception):
    """
    Base exception for Google authentication failures.
    Raised when the token is invalid, expired, or malformed.
    """

    pass


class EmailNotVerifiedError(GoogleAuthError):
    """
    Exception raised when a valid Google token is presented,
    but the associated email address has not been verified by Google.
    """

    pass


def verify_google_token(credential: str) -> Dict[str, Any]:
    """
    Verifies a Google ID token and extracts user information.

    This function performs the following checks:
    1. Validates the JWT signature using Google's public keys.
    2. Checks the `aud` (audience) claim matches the configured Client ID.
    3. Checks the `iss` (issuer) claim is a valid Google issuer.
    4. Checks the `exp` (expiration) claim.
    5. Verifies that `email_verified` is true.

    Args:
        credential (str): The raw Google ID token (JWT string).

    Returns:
        Dict[str, Any]: A dictionary containing the user's profile information:
            - sub: The unique Google user ID.
            - email: The user's email address.
            - name: The user's full name.
            - picture: The URL to the user's profile picture.
            - email_verified: Boolean indicating email verification status.

    Raises:
        GoogleAuthError: If the token is invalid, expired, or from the wrong issuer.
        EmailNotVerifiedError: If the email address is not verified.
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
        # Invalid token (signature, expiration, etc.)
        error_msg = str(e)
        logger.warning(f"Google token verification failed: {error_msg}")
        raise GoogleAuthError(f"Invalid Google credential: {error_msg}")
    except Exception as e:
        logger.error(f"Unexpected error during Google auth: {str(e)}")
        raise GoogleAuthError("Authentication failed")
