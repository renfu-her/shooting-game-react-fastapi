"""Authentication API endpoints."""
from fastapi import APIRouter, HTTPException
from app.controllers.auth_controller import AuthController
from app.models.user import TokenVerifyRequest, TokenVerifyResponse, User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/verify", response_model=TokenVerifyResponse)
async def verify_token(request: TokenVerifyRequest):
    """Verify Firebase ID token.
    
    Args:
        request: TokenVerifyRequest containing id_token
        
    Returns:
        TokenVerifyResponse with validation result and user info
    """
    try:
        response = AuthController.verify_token(request)
        if not response.valid:
            raise HTTPException(status_code=401, detail=response.error or "Invalid token")
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{uid}", response_model=User)
async def get_user(uid: str):
    """Get user information by UID.
    
    Args:
        uid: User ID
        
    Returns:
        User object
    """
    try:
        user = AuthController.get_user_info(uid)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

