"""User data models."""
from pydantic import BaseModel, EmailStr
from typing import Optional


class User(BaseModel):
    """User model."""
    uid: str
    email: Optional[EmailStr] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    email_verified: bool = False


class TokenVerifyRequest(BaseModel):
    """Request model for token verification."""
    id_token: str


class TokenVerifyResponse(BaseModel):
    """Response model for token verification."""
    valid: bool
    user: Optional[User] = None
    error: Optional[str] = None

