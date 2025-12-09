"""Authentication controller - business logic for authentication operations."""
from sqlalchemy.orm import Session
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.models.user import LoginRequest, TokenResponse, UserInfo
from datetime import timedelta
from app.config import JWT_ACCESS_TOKEN_EXPIRE_MINUTES


class AuthController:
    """Controller for authentication operations."""
    
    @staticmethod
    def login(db: Session, request: LoginRequest) -> TokenResponse:
        """Authenticate user and generate access token.
        
        Args:
            db: Database session
            request: LoginRequest containing email and password
            
        Returns:
            TokenResponse with access token and user info
            
        Raises:
            ValueError: If authentication fails
        """
        # Authenticate user from database
        user = UserService.verify_user_password(db, request.email, request.password)
        if not user:
            raise ValueError("Invalid email or password")
        
        # Create access token
        access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = AuthService.create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )
        
        # Create user info
        user_info = UserInfo(email=user.email, is_authenticated=True)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_info
        )
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify JWT token and return user information.
        
        Args:
            token: JWT token string
            
        Returns:
            User information from token
            
        Raises:
            ValueError: If token is invalid
        """
        payload = AuthService.verify_token(token)
        if payload is None:
            raise ValueError("Invalid or expired token")
        
        email: str = payload.get("sub")
        if email is None:
            raise ValueError("Token missing user information")
        
        return {
            "email": email,
            "is_authenticated": True
        }

