"""Firebase Authentication service."""
import firebase_admin
from firebase_admin import credentials, auth
from pathlib import Path
import os
from app.config import FIREBASE_CREDENTIALS_PATH, FIREBASE_PROJECT_ID
from typing import Dict, Any, Optional

# Initialize Firebase Admin SDK
_firebase_app = None


def _initialize_firebase():
    """Initialize Firebase Admin SDK."""
    global _firebase_app
    
    if _firebase_app is None:
        cred_path = Path(FIREBASE_CREDENTIALS_PATH)
        
        if not cred_path.exists():
            raise FileNotFoundError(
                f"Firebase credentials file not found at {FIREBASE_CREDENTIALS_PATH}. "
                "Please set FIREBASE_CREDENTIALS_PATH environment variable or place "
                "firebase-credentials.json in the backend directory."
            )
        
        cred = credentials.Certificate(str(cred_path))
        _firebase_app = firebase_admin.initialize_app(
            cred,
            {
                "projectId": FIREBASE_PROJECT_ID or cred.project_id
            }
        )
    
    return _firebase_app


class AuthService:
    """Service for Firebase Authentication operations."""
    
    @staticmethod
    def verify_token(id_token: str) -> Dict[str, Any]:
        """Verify Firebase ID token and return decoded token.
        
        Args:
            id_token: Firebase ID token string
            
        Returns:
            Decoded token containing user information
            
        Raises:
            ValueError: If token is invalid
        """
        try:
            _initialize_firebase()  # Ensure Firebase is initialized
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except auth.InvalidIdTokenError:
            raise ValueError("Invalid ID token")
        except auth.ExpiredIdTokenError:
            raise ValueError("Expired ID token")
        except Exception as e:
            raise ValueError(f"Token verification failed: {str(e)}")
    
    @staticmethod
    def get_user(uid: str) -> Optional[Dict[str, Any]]:
        """Get user information by UID.
        
        Args:
            uid: User ID
            
        Returns:
            User record or None if not found
        """
        try:
            _initialize_firebase()  # Ensure Firebase is initialized
            user_record = auth.get_user(uid)
            return {
                "uid": user_record.uid,
                "email": user_record.email,
                "display_name": user_record.display_name,
                "photo_url": user_record.photo_url,
                "email_verified": user_record.email_verified,
            }
        except auth.UserNotFoundError:
            return None
        except Exception as e:
            raise Exception(f"Error getting user: {str(e)}")
    
    @staticmethod
    def create_custom_token(uid: str, additional_claims: Optional[Dict[str, Any]] = None) -> str:
        """Create a custom token for a user.
        
        Args:
            uid: User ID
            additional_claims: Additional custom claims
            
        Returns:
            Custom token string
        """
        try:
            _initialize_firebase()  # Ensure Firebase is initialized
            return auth.create_custom_token(uid, additional_claims).decode('utf-8')
        except Exception as e:
            raise Exception(f"Error creating custom token: {str(e)}")

