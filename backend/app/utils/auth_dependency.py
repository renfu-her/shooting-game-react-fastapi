"""Authentication dependency for protecting API endpoints."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.auth_service import AuthService

security = HTTPBearer()


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> bool:
    """Dependency to verify API token.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        True if token is valid
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    token = credentials.credentials
    
    if not AuthService.verify_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return True

