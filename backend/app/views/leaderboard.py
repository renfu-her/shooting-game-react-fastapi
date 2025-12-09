"""Leaderboard API endpoints."""
from fastapi import APIRouter, HTTPException, Query, Depends
from app.controllers.leaderboard_controller import LeaderboardController
from app.models.leaderboard import LeaderboardEntry, AddScoreRequest, LeaderboardResponse
from app.utils.auth_dependency import verify_token
from typing import List

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardResponse)
async def get_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    _: bool = Depends(verify_token)
):
    """Get top leaderboard entries.
    
    Args:
        limit: Maximum number of entries to return (default: 10, max: 100)
        
    Returns:
        LeaderboardResponse with entries and total count
    """
    try:
        entries = LeaderboardController.get_leaderboard(limit)
        return LeaderboardResponse(entries=entries, total=len(entries))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=LeaderboardEntry, status_code=201)
async def add_score(
    request: AddScoreRequest,
    _: bool = Depends(verify_token)
):
    """Add a new score to the leaderboard.
    
    Args:
        request: AddScoreRequest containing name, score, and maxCombo
        
    Returns:
        Created leaderboard entry
    """
    try:
        entry = LeaderboardController.add_score(request)
        return entry
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

