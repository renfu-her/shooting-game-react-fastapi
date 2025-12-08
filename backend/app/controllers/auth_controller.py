"""Authentication controller - business logic for authentication operations."""
from app.services.auth_service import AuthService
from app.models.user import User, TokenVerifyRequest, TokenVerifyResponse


class AuthController:
    """Controller for authentication operations."""
    
    @staticmethod
    def verify_token(request: TokenVerifyRequest) -> TokenVerifyResponse:
        """Verify Firebase ID token.
        
        Args:
            request: TokenVerifyRequest containing id_token
            
        Returns:
            TokenVerifyResponse with validation result and user info
        """
        try:
            decoded_token = AuthService.verify_token(request.id_token)
            uid = decoded_token.get("uid")
            
            if uid:
                user_info = AuthService.get_user(uid)
                if user_info:
                    user = User(**user_info)
                    return TokenVerifyResponse(valid=True, user=user)
            
            return TokenVerifyResponse(valid=False, error="User not found")
        except ValueError as e:
            return TokenVerifyResponse(valid=False, error=str(e))
        except Exception as e:
            return TokenVerifyResponse(valid=False, error=f"Authentication error: {str(e)}")
    
    @staticmethod
    def get_user_info(uid: str) -> User:
        """Get user information by UID.
        
        Args:
            uid: User ID
            
        Returns:
            User object
            
        Raises:
            ValueError: If user not found
        """
        try:
            user_info = AuthService.get_user(uid)
            if not user_info:
                raise ValueError("User not found")
            return User(**user_info)
        except Exception as e:
            raise ValueError(f"Failed to get user info: {str(e)}")

