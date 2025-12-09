"""User authentication models."""
from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token response model."""
    access_token: str
    token_type: str = "bearer"
    user: Optional["UserInfo"] = None


class UserInfo(BaseModel):
    """User information model."""
    email: str
    is_authenticated: bool = True


TokenResponse.model_rebuild()

