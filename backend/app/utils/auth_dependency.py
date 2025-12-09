"""Authentication dependency for protecting API endpoints."""
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import APIKeyHeader
from app.services.auth_service import AuthService
import logging

logger = logging.getLogger(__name__)

# Use APIKeyHeader with name "token" for authentication
# This will show up in Swagger UI as a parameter
from app.config import API_TOKEN

api_key_header = APIKeyHeader(
    name="token",
    auto_error=False,
    description=f"API token for authentication. Get token from GET /api/auth/token endpoint. Example: {API_TOKEN}"
)


async def verify_token(
    token: str = Security(api_key_header)
) -> str:
    """Dependency to verify API token.
    
    Args:
        token: API token from "token" header
        
    Returns:
        True if token is valid
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    if not token:
        logger.warning("No token provided in request")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing token. Please provide 'token' header with API token",
        )
    
    if not AuthService.verify_token(token):
        logger.warning(f"Invalid token provided: {token[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    return token

