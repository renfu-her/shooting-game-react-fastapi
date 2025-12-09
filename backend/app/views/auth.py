"""Authentication API endpoints."""
from fastapi import APIRouter, Query
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/token", response_model=dict)
async def get_token():
    """Get API token for authentication.
    
    This endpoint returns the API token that should be used for authentication.
    
    Returns:
        Token information
    """
    from app.config import API_TOKEN
    return {
        "token": API_TOKEN,
        "message": "Use this token in Authorization header as Bearer token"
    }


@router.get("/verify", response_model=dict)
async def verify_token(
    token: str = Query(None, description="API token to verify")
):
    """Verify API token.
    
    This endpoint does not require authentication and can verify a token.
    
    Args:
        token: Optional API token to verify (query parameter)
        
    Returns:
        Verification result
    """
    if not token:
        return {"valid": False, "message": "No token provided"}
    
    is_valid = AuthService.verify_token(token)
    return {
        "valid": is_valid,
        "message": "Token is valid" if is_valid else "Invalid token"
    }

