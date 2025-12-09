"""SQLAlchemy database models."""
from sqlalchemy import Column, Integer, String, BigInteger, DateTime
from sqlalchemy.sql import func
from app.database import Base


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


