"""Authentication API endpoints."""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from app.controllers.auth_controller import AuthController
from app.models.user import LoginRequest, TokenResponse
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint to authenticate user and get access token.
    
    Args:
        request: LoginRequest containing email and password
        db: Database session
        
    Returns:
        TokenResponse with access token and user info
    """
    try:
        response = AuthController.login(db, request)
        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )


@router.get("/user", response_model=dict)
async def get_current_user_info(
    token: str = Query(None, description="JWT token to verify"),
    db: Session = Depends(get_db)
):
    """Get current authenticated user information.
    
    This endpoint does not require authentication and can optionally verify a token.
    
    Args:
        token: Optional JWT token to verify (query parameter)
        db: Database session
        
    Returns:
        User information dictionary or error message
    """
    if not token:
        return {"message": "No token provided"}
    
    try:
        from app.services.auth_service import AuthService
        payload = AuthService.verify_token(token)
        if payload is None:
            return {"error": "Invalid or expired token"}
        
        email: str = payload.get("sub")
        if email is None:
            return {"error": "Token missing user information"}
        
        return {
            "email": email,
            "is_authenticated": True
        }
    except Exception as e:
        return {"error": f"Token verification failed: {str(e)}"}

