"""Authentication service for API token validation."""
from app.config import API_TOKEN


class AuthService:
    """Service for authentication operations."""
    
    @staticmethod
    def verify_token(token: str) -> bool:
        """Verify API token.
        
        Args:
            token: API token string
            
        Returns:
            True if token is valid, False otherwise
        """
        return token == API_TOKEN

