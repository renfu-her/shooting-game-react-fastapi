"""User service for database operations."""
from sqlalchemy.orm import Session
from app.models.db_models import UserDB
from app.services.auth_service import AuthService
from typing import Optional


class UserService:
    """Service for user database operations."""
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[UserDB]:
        """Get user by email.
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            UserDB object or None if not found
        """
        return db.query(UserDB).filter(UserDB.email == email).first()
    
    @staticmethod
    def create_user(db: Session, email: str, password: str) -> UserDB:
        """Create a new user.
        
        Args:
            db: Database session
            email: User email
            password: Plain text password (will be hashed)
            
        Returns:
            Created UserDB object
        """
        password_hash = AuthService.get_password_hash(password)
        user = UserDB(
            email=email,
            password_hash=password_hash,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def verify_user_password(db: Session, email: str, password: str) -> Optional[UserDB]:
        """Verify user password.
        
        Args:
            db: Database session
            email: User email
            password: Plain text password
            
        Returns:
            UserDB object if password is correct, None otherwise
        """
        user = UserService.get_user_by_email(db, email)
        if not user:
            return None
        
        if not user.is_active:
            return None
        
        if not AuthService.verify_password(password, user.password_hash):
            return None
        
        return user
    
    @staticmethod
    def user_exists(db: Session, email: str) -> bool:
        """Check if user exists.
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            True if user exists, False otherwise
        """
        user = UserService.get_user_by_email(db, email)
        return user is not None

