"""SQLAlchemy database models."""
from sqlalchemy import Column, Integer, String, BigInteger, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base


class UserDB(Base):
    """User database model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<UserDB(id={self.id}, email='{self.email}', is_active={self.is_active})>"


class LeaderboardEntryDB(Base):
    """Leaderboard entry database model."""
    __tablename__ = "leaderboard"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(50), nullable=False, index=True)
    score = Column(Integer, nullable=False, index=True)
    max_combo = Column(Integer, nullable=False, default=0)
    timestamp = Column(BigInteger, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<LeaderboardEntryDB(id={self.id}, name='{self.name}', score={self.score})>"


