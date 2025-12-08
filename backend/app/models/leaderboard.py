"""Leaderboard data models."""
from pydantic import BaseModel, Field
from typing import Optional


class LeaderboardEntry(BaseModel):
    """Leaderboard entry model."""
    name: str = Field(..., min_length=1, max_length=50, description="Player name")
    score: int = Field(..., ge=0, description="Player score")
    maxCombo: int = Field(..., ge=0, description="Maximum combo achieved")
    timestamp: Optional[float] = Field(None, description="Timestamp in milliseconds")
    id: Optional[str] = Field(None, description="Entry ID from database")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Player One",
                "score": 150,
                "maxCombo": 5,
                "timestamp": 1703123456789
            }
        }


class LeaderboardResponse(BaseModel):
    """Response model for leaderboard list."""
    entries: list[LeaderboardEntry]
    total: int


class AddScoreRequest(BaseModel):
    """Request model for adding a score."""
    name: str = Field(..., min_length=1, max_length=50)
    score: int = Field(..., ge=0)
    maxCombo: int = Field(..., ge=0)

